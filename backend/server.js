const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();

const PORT = 5000;


/* ============================================
   MIDDLEWARE
============================================ */

app.use(cors());

app.use(express.json());


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
   HEALTH CHECK
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

app.post(
    "/api/generate-comment",
    (req, res) => {

        const {
            code,
            language
        } = req.body;


        /* -------------------------------
           Validate request
        -------------------------------- */

        if (!code || !code.trim()) {

            return res.status(400).json({

                success: false,

                error: "Code is required."

            });

        }


        const selectedLanguage =
            language || "python";


        /* -------------------------------
           Start Python NLP
        -------------------------------- */

        const pythonProcess = spawn(

            "python",

            [
                "../nlp/app.py",
                code,
                selectedLanguage
            ]

        );


        let output = "";

        let errorOutput = "";


        /* -------------------------------
           Receive Python output
        -------------------------------- */

        pythonProcess.stdout.on(
            "data",
            (data) => {

                output +=
                    data.toString();

            }
        );


        /* -------------------------------
           Receive Python errors
        -------------------------------- */

        pythonProcess.stderr.on(
            "data",
            (data) => {

                errorOutput +=
                    data.toString();

            }
        );


        /* -------------------------------
           Python process completed
        -------------------------------- */

        pythonProcess.on(
            "close",
            (exitCode) => {


                if (exitCode !== 0) {

                    console.error(
                        "Python Error:",
                        errorOutput
                    );


                    return res
                        .status(500)
                        .json({

                            success: false,

                            error:
                                "NLP service failed."

                        });

                }


                /* ---------------------------
                   Convert Python JSON
                ---------------------------- */

                try {

                    const result =
                        JSON.parse(output);


                    res.json(result);


                } catch (error) {

                    console.error(
                        "Invalid NLP response:",
                        output
                    );


                    res.status(500)
                        .json({

                            success: false,

                            error:
                                "Invalid response from NLP service."

                        });

                }

            }
        );

    }
);


/* ============================================
   RUN PYTHON CODE
============================================ */

app.post(
    "/api/run-code",
    (req, res) => {

        const { code } = req.body;


        if (!code || !code.trim()) {

            return res.status(400).json({

                success: false,

                error: "Code is required."

            });

        }


        /* -------------------------------
           Execute Python code
        -------------------------------- */

        const pythonProcess = spawn(
            "python",
            ["-c", code]
        );


        let output = "";

        let errorOutput = "";


        pythonProcess.stdout.on(
            "data",
            (data) => {

                output +=
                    data.toString();

            }
        );


        pythonProcess.stderr.on(
            "data",
            (data) => {

                errorOutput +=
                    data.toString();

            }
        );


        pythonProcess.on(
            "close",
            (exitCode) => {


                if (exitCode !== 0) {

                    return res
                        .status(400)
                        .json({

                            success: false,

                            error:
                                errorOutput ||
                                "Code execution failed."

                        });

                }


                res.json({

                    success: true,

                    output:
                        output.trim()

                });

            }
        );

    }
);


/* ============================================
   START SERVER
============================================ */

app.listen(
    PORT,
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
            `Server: http://localhost:${PORT}`
        );

        console.log(
            "Status: ONLINE"
        );

        console.log(
            "NLP: Python Connected"
        );

        console.log(
            "========================================"
        );

        console.log("");

    }
);