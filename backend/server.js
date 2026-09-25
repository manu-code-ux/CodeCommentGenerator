const express = require("express");
const cors = require("cors");
const { spawn, execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* ============================================
   PATHS
============================================ */

const PROJECT_ROOT = path.resolve(__dirname, "..");
const NLP_APP = path.join(PROJECT_ROOT, "nlp", "app.py");

const MSYS2_BASH = "C:\\msys64\\usr\\bin\\bash.exe";

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
        console.error("Cleanup error:", error.message);
    }
}

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
        .replace(/^([A-Za-z]):/, (_, drive) => {
            return "/" + drive.toLowerCase();
        });
}

/* ============================================
   HOME
============================================ */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CodeComment AI Backend is running"
    });
});

/* ============================================
   HEALTH
============================================ */

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "CodeComment AI",
        status: "online"
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
        (language || "python").toLowerCase();

    const pythonProcess = spawn(
        "python",
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
        console.error(error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: "Python NLP service could not start."
            });
        }
    });

    pythonProcess.on("close", (exitCode) => {
        if (res.headersSent) {
            return;
        }

        if (exitCode !== 0) {
            console.error(errorOutput);

            return res.status(500).json({
                success: false,
                error:
                    errorOutput.trim() ||
                    "NLP service failed."
            });
        }

        try {
            const result = JSON.parse(output);
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
        "python",
        ["-c", code]
    );

    collectProcessOutput(process, res);
}

/* ============================================
   RUN JAVASCRIPT
============================================ */

function runJavaScript(code, res) {
    const process = spawn(
        "node",
        ["-e", code]
    );

    collectProcessOutput(process, res);
}

/* ============================================
   RUN JAVA
============================================ */

function runJava(code, res) {
    const tempDirectory = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "codecomment-java-"
        )
    );

    const javaFile = path.join(
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
                    cleanupDirectory(tempDirectory);

                    return res.status(400).json({
                        success: false,
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
                    (runError, runStdout, runStderr) => {
                        cleanupDirectory(tempDirectory);

                        if (runError) {
                            return res.status(400).json({
                                success: false,
                                error:
                                    runStderr.trim() ||
                                    runError.message ||
                                    "Java execution failed."
                            });
                        }

                        return res.json({
                            success: true,
                            language: "java",
                            output: runStdout.trim()
                        });
                    }
                );
            }
        );
    } catch (error) {
        cleanupDirectory(tempDirectory);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/* ============================================
   RUN C++
   
   IMPORTANT:
   C++ is compiled AND executed through
   MSYS2 UCRT64 bash environment.
============================================ */

function runCpp(code, res) {
    const tempDirectory = fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "codecomment-cpp-"
        )
    );

    const cppFile = path.join(
        tempDirectory,
        "main.cpp"
    );

    const exeFile = path.join(
        tempDirectory,
        "main.exe"
    );

    try {
        fs.writeFileSync(
            cppFile,
            code,
            "utf8"
        );

        const msysCppFile = toMsysPath(cppFile);
        const msysExeFile = toMsysPath(exeFile);

        /*
         * Compile and execute inside the SAME
         * MSYS2 UCRT64 environment.
         *
         * This avoids the Windows direct-exec
         * problem with MSYS2/UCRT64 DLLs.
         */

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
                maxBuffer: 1024 * 1024
            },
            (error, stdout, stderr) => {
                cleanupDirectory(tempDirectory);

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
                    output: stdout.trim()
                });
            }
        );
    } catch (error) {
        cleanupDirectory(tempDirectory);

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
    const { code, language } = req.body;

    /* -----------------------------------------
       Validate code
    ----------------------------------------- */

    if (!code || !code.trim()) {
        return res.status(400).json({
            success: false,
            error: "Code is required."
        });
    }

    /* -----------------------------------------
       Validate language
    ----------------------------------------- */

    if (!language) {
        return res.status(400).json({
            success: false,
            error: "Language is required."
        });
    }

    const selectedLanguage =
        language.toLowerCase().trim();

    console.log(
        `Running ${selectedLanguage} code...`
    );

    /* =========================================
       PYTHON
    ========================================= */

    if (selectedLanguage === "python") {
        return runPython(code, res);
    }

    /* =========================================
       JAVASCRIPT
    ========================================= */

    if (
        selectedLanguage === "javascript" ||
        selectedLanguage === "js"
    ) {
        return runJavaScript(code, res);
    }

    /* =========================================
       JAVA
    ========================================= */

    if (selectedLanguage === "java") {
        return runJava(code, res);
    }

    /* =========================================
       C++
    ========================================= */

    if (
        selectedLanguage === "cpp" ||
        selectedLanguage === "c++"
    ) {
        return runCpp(code, res);
    }

    /* =========================================
       UNSUPPORTED LANGUAGE
    ========================================= */

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
        console.log("========================================");
        console.log("       CodeComment AI Backend");
        console.log("========================================");
        console.log(
            `Server: http://localhost:${PORT}`
        );
        console.log("Status: ONLINE");
        console.log("Python: Connected");
        console.log("JavaScript: Connected");
        console.log("Java: Connected");
        console.log("C++: Connected");
        console.log("========================================");
        console.log("");
    }
);

server.on("error", (error) => {
    console.error("SERVER ERROR:");
    console.error(error);
});

server.on("close", () => {
    console.log("SERVER CLOSED");
});