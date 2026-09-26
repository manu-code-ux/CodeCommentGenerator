const express = require("express");
const cors = require("cors");
const { spawn, execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();

/* ============================================
   SERVER CONFIGURATION
============================================ */

const PORT = process.env.PORT || 5000;

const IS_WINDOWS = process.platform === "win32";

const PYTHON_COMMAND = process.env.PYTHON_COMMAND ||
    (IS_WINDOWS ? "python" : "python3");

/* ============================================
   MIDDLEWARE
============================================ */

app.use(
    cors({
        origin: [
            "https://codecommentgenerator-1.onrender.com",
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        ],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"]
    })
);

app.use(express.json({ limit: "1mb" }));

/* ============================================
   PATHS
============================================ */

const PROJECT_ROOT = path.resolve(__dirname, "..");

const NLP_APP = path.join(
    PROJECT_ROOT,
    "nlp",
    "app.py"
);

/*
   Windows-only MSYS2 path.
   Used only when running locally on Windows.
*/
const MSYS2_BASH = "C:\\msys64\\usr\\bin\\bash.exe";

/* ============================================
   LOGGING
============================================ */

console.log("========================================");
console.log("       CodeComment AI Backend");
console.log("========================================");
console.log("Platform:", process.platform);
console.log("Node:", process.version);
console.log("Python command:", PYTHON_COMMAND);
console.log("Project root:", PROJECT_ROOT);
console.log("NLP app:", NLP_APP);
console.log("========================================");

/* ============================================
   HELPERS
============================================ */

function cleanupDirectory(directory) {
    try {
        fs.rmSync(directory, {
            recursive: true,
            force: true
        });
    } catch (error) {
        console.error(
            "Cleanup error:",
            error.message
        );
    }
}

/* ============================================
   COLLECT PROCESS OUTPUT
============================================ */

function collectProcessOutput(process, res) {
    let output = "";
    let errorOutput = "";
    let responded = false;

    process.stdout.on("data", (data) => {
        output += data.toString();
    });

    process.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    process.on("error", (error) => {
        if (responded || res.headersSent) {
            return;
        }

        responded = true;

        return res.status(500).json({
            success: false,
            error: error.message
        });
    });

    process.on("close", (exitCode) => {
        if (responded || res.headersSent) {
            return;
        }

        if (exitCode !== 0) {
            responded = true;

            return res.status(400).json({
                success: false,
                error:
                    errorOutput.trim() ||
                    "Code execution failed."
            });
        }

        responded = true;

        return res.json({
            success: true,
            output: output.trim()
        });
    });
}

/* ============================================
   WINDOWS PATH -> MSYS2 PATH
============================================ */

function toMsysPath(filePath) {
    return filePath
        .replace(/\\/g, "/")
        .replace(
            /^([A-Za-z]):/,
            (_, drive) => {
                return "/" + drive.toLowerCase();
            }
        );
}

/* ============================================
   HOME
============================================ */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CodeComment AI Backend is running",
        platform: process.platform
    });
});

/* ============================================
   HEALTH CHECK
============================================ */

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "CodeComment AI",
        status: "online",
        platform: process.platform,
        python: PYTHON_COMMAND,
        nlpAppExists: fs.existsSync(NLP_APP)
    });
});

/* ============================================
   GENERATE COMMENT
============================================ */

app.post("/api/generate-comment", (req, res) => {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({
            success: false,
            error: "Code is required."
        });
    }

    const selectedLanguage =
        (language || "python")
            .toLowerCase()
            .trim();

    if (!fs.existsSync(NLP_APP)) {
        console.error(
            "NLP application not found:",
            NLP_APP
        );

        return res.status(500).json({
            success: false,
            error:
                "NLP application file was not found on the server."
        });
    }

    console.log(
        `Generating comment for ${selectedLanguage}`
    );

    const pythonProcess = spawn(
        PYTHON_COMMAND,
        [
            NLP_APP,
            code,
            selectedLanguage
        ],
        {
            cwd: PROJECT_ROOT
        }
    );

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on("error", (error) => {
        console.error(
            "Python process error:",
            error
        );

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error:
                    "Python NLP service could not start.",
                details: error.message
            });
        }
    });

    pythonProcess.on("close", (exitCode) => {
        if (res.headersSent) {
            return;
        }

        if (exitCode !== 0) {
            console.error(
                "NLP ERROR:",
                errorOutput
            );

            return res.status(500).json({
                success: false,
                error:
                    errorOutput.trim() ||
                    "NLP service failed."
            });
        }

        try {
            const result = JSON.parse(
                output.trim()
            );

            return res.json(result);
        } catch (error) {
            console.error(
                "Invalid NLP response:",
                output
            );

            return res.status(500).json({
                success: false,
                error:
                    "Invalid response from NLP service."
            });
        }
    });
});

/* ============================================
   RUN PYTHON
============================================ */

function runPython(code, res) {
    const process = spawn(
        PYTHON_COMMAND,
        ["-c", code],
        {
            cwd: PROJECT_ROOT
        }
    );

    collectProcessOutput(
        process,
        res
    );
}

/* ============================================
   RUN JAVASCRIPT
============================================ */

function runJavaScript(code, res) {
    const process = spawn(
        "node",
        ["-e", code],
        {
            cwd: PROJECT_ROOT
        }
    );

    collectProcessOutput(
        process,
        res
    );
}

/* ============================================
   RUN JAVA
============================================ */

function runJava(code, res) {
    const tempDirectory =
        fs.mkdtempSync(
            path.join(
                os.tmpdir(),
                "codecomment-java-"
            )
        );

    const javaFile =
        path.join(
            tempDirectory,
            "Main.java"
        );

    try {
        fs.writeFileSync(
            javaFile,
            code,
            "utf8"
        );

        execFile(
            "javac",
            [javaFile],
            (compileError, stdout, stderr) => {

                if (compileError) {
                    cleanupDirectory(
                        tempDirectory
                    );

                    return res.status(400).json({
                        success: false,
                        language: "java",
                        error:
                            stderr.trim() ||
                            compileError.message ||
                            "Java compilation failed."
                    });
                }

                execFile(
                    "java",
                    [
                        "-cp",
                        tempDirectory,
                        "Main"
                    ],
                    (
                        runError,
                        runStdout,
                        runStderr
                    ) => {

                        cleanupDirectory(
                            tempDirectory
                        );

                        if (runError) {
                            return res.status(400).json({
                                success: false,
                                language: "java",
                                error:
                                    runStderr.trim() ||
                                    runError.message ||
                                    "Java execution failed."
                            });
                        }

                        return res.json({
                            success: true,
                            language: "java",
                            output:
                                runStdout.trim()
                        });
                    }
                );
            }
        );

    } catch (error) {

        cleanupDirectory(
            tempDirectory
        );

        return res.status(500).json({
            success: false,
            language: "java",
            error: error.message
        });
    }
}

/* ============================================
   RUN C++
============================================ */

function runCpp(code, res) {

    const tempDirectory =
        fs.mkdtempSync(
            path.join(
                os.tmpdir(),
                "codecomment-cpp-"
            )
        );

    const cppFile =
        path.join(
            tempDirectory,
            "main.cpp"
        );

    const exeFile =
        path.join(
            tempDirectory,
            IS_WINDOWS
                ? "main.exe"
                : "main"
        );

    try {

        fs.writeFileSync(
            cppFile,
            code,
            "utf8"
        );

        /*
           WINDOWS
           --------
           Use MSYS2 UCRT64.
        */

        if (IS_WINDOWS) {

            if (
                !fs.existsSync(
                    MSYS2_BASH
                )
            ) {
                cleanupDirectory(
                    tempDirectory
                );

                return res.status(500).json({
                    success: false,
                    language: "cpp",
                    error:
                        "MSYS2 bash was not found."
                });
            }

            const msysCppFile =
                toMsysPath(cppFile);

            const msysExeFile =
                toMsysPath(exeFile);

            const bashCommand =
                "export PATH=/ucrt64/bin:/usr/bin && " +
                `g++ "${msysCppFile}" -o "${msysExeFile}" && ` +
                `"${msysExeFile}"`;

            execFile(
                MSYS2_BASH,
                [
                    "-lc",
                    bashCommand
                ],
                {
                    windowsHide: true,
                    maxBuffer:
                        1024 * 1024
                },
                (
                    error,
                    stdout,
                    stderr
                ) => {

                    cleanupDirectory(
                        tempDirectory
                    );

                    if (error) {
                        return res.status(400).json({
                            success: false,
                            language: "cpp",
                            error:
                                stderr.trim() ||
                                stdout.trim() ||
                                error.message ||
                                "C++ compilation/execution failed."
                        });
                    }

                    return res.json({
                        success: true,
                        language: "cpp",
                        output:
                            stdout.trim()
                    });
                }
            );

            return;
        }

        /*
           LINUX / RENDER
           --------------
           Use normal g++.
        */

        execFile(
            "g++",
            [
                cppFile,
                "-o",
                exeFile
            ],
            {
                maxBuffer:
                    1024 * 1024
            },
            (
                compileError,
                stdout,
                stderr
            ) => {

                if (compileError) {

                    cleanupDirectory(
                        tempDirectory
                    );

                    return res.status(400).json({
                        success: false,
                        language: "cpp",
                        error:
                            stderr.trim() ||
                            compileError.message ||
                            "C++ compilation failed."
                    });
                }

                execFile(
                    exeFile,
                    [],
                    {
                        cwd: tempDirectory,
                        maxBuffer:
                            1024 * 1024
                    },
                    (
                        runError,
                        runStdout,
                        runStderr
                    ) => {

                        cleanupDirectory(
                            tempDirectory
                        );

                        if (runError) {
                            return res.status(400).json({
                                success: false,
                                language: "cpp",
                                error:
                                    runStderr.trim() ||
                                    runError.message ||
                                    "C++ execution failed."
                            });
                        }

                        return res.json({
                            success: true,
                            language: "cpp",
                            output:
                                runStdout.trim()
                        });
                    }
                );
            }
        );

    } catch (error) {

        cleanupDirectory(
            tempDirectory
        );

        return res.status(500).json({
            success: false,
            language: "cpp",
            error: error.message
        });
    }
}

/* ============================================
   RUN CODE
============================================ */

app.post("/api/run-code", (req, res) => {

    const { code, language } =
        req.body;

    if (!code || !code.trim()) {
        return res.status(400).json({
            success: false,
            error: "Code is required."
        });
    }

    if (!language) {
        return res.status(400).json({
            success: false,
            error: "Language is required."
        });
    }

    const selectedLanguage =
        language
            .toLowerCase()
            .trim();

    console.log(
        `Running ${selectedLanguage} code...`
    );

    /* PYTHON */

    if (
        selectedLanguage === "python"
    ) {
        return runPython(
            code,
            res
        );
    }

    /* JAVASCRIPT */

    if (
        selectedLanguage === "javascript" ||
        selectedLanguage === "js"
    ) {
        return runJavaScript(
            code,
            res
        );
    }

    /* JAVA */

    if (
        selectedLanguage === "java"
    ) {
        return runJava(
            code,
            res
        );
    }

    /* C++ */

    if (
        selectedLanguage === "cpp" ||
        selectedLanguage === "c++"
    ) {
        return runCpp(
            code,
            res
        );
    }

    return res.status(400).json({
        success: false,
        error:
            `Language '${language}' is not supported.`
    });
});

/* ============================================
   START SERVER
============================================ */

const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            "       CodeComment AI Backend"
        );
        console.log(
            "========================================"
        );
        console.log(
            `Server listening on port ${PORT}`
        );
        console.log(
            `Platform: ${process.platform}`
        );
        console.log(
            `Python: ${PYTHON_COMMAND}`
        );
        console.log(
            `NLP file exists: ${fs.existsSync(NLP_APP)}`
        );
        console.log(
            "Status: ONLINE"
        );
        console.log(
            "========================================"
        );
        console.log("");
    }
);

server.on("error", (error) => {
    console.error(
        "SERVER ERROR:",
        error
    );
});

server.on("close", () => {
    console.log(
        "SERVER CLOSED"
    );
});