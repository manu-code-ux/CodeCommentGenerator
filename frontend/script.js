const codeInput = document.getElementById("codeInput");
const language = document.getElementById("language");

const generateBtn = document.getElementById("generateBtn");
const runBtn = document.getElementById("runBtn");
const clearBtn = document.getElementById("clearBtn");
const sampleBtn = document.getElementById("sampleBtn");
const copyBtn = document.getElementById("copyBtn");

const commentOutput = document.getElementById("commentOutput");
const terminalOutput = document.getElementById("outputText");
const executionStatus = document.getElementById("executionStatus");
const lineNumbers = document.getElementById("lineNumbers");


/* =====================================================
   BACKEND
===================================================== */

const BACKEND_URL =
    "https://codecomment-backend-api.onrender.com";


/* =====================================================
   LINE NUMBERS
===================================================== */

function updateLineNumbers() {

    const lines = codeInput.value.split("\n").length;

    let numbers = "";

    for (let i = 1; i <= lines; i++) {
        numbers += i + "<br>";
    }

    lineNumbers.innerHTML = numbers;
}

codeInput.addEventListener(
    "input",
    updateLineNumbers
);


/* =====================================================
   SAMPLE
===================================================== */

sampleBtn.addEventListener(
    "click",
    () => {

        language.value = "python";

        codeInput.value =
`def calculate_sum(a, b):
    result = a + b
    return result

x = 10
y = 20

total = calculate_sum(x, y)

print(total)`;

        updateLineNumbers();

        commentOutput.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✨</div>

                <h3>
                    Ready to analyze
                </h3>

                <p>
                    Click
                    <strong>Generate Comment</strong>
                    to analyze the sample code.
                </p>
            </div>
        `;

        terminalOutput.textContent =
            "Run your code to see the output...";

        executionStatus.textContent =
            "Ready";
    }
);


/* =====================================================
   CLEAR
===================================================== */

clearBtn.addEventListener(
    "click",
    () => {

        codeInput.value = "";

        updateLineNumbers();

        commentOutput.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ✨
                </div>

                <h3>
                    Your comment will appear here
                </h3>

                <p>
                    Enter some code and click
                    <strong>Generate Comment</strong>
                    to analyze it.
                </p>

            </div>
        `;

        terminalOutput.textContent =
            "Run your code to see the output...";

        executionStatus.textContent =
            "Ready";
    }
);


/* =====================================================
   GENERATE COMMENT
===================================================== */

generateBtn.addEventListener(
    "click",
    async () => {

        const code =
            codeInput.value.trim();

        const selectedLanguage =
            language.value;


        if (!code) {

            alert(
                "Please enter some code first."
            );

            return;
        }


        generateBtn.disabled = true;

        generateBtn.textContent =
            "⏳ Generating...";


        commentOutput.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🤖
                </div>

                <h3>
                    Analyzing your code...
                </h3>

                <p>
                    NLP engine is generating
                    a meaningful comment.
                </p>

            </div>
        `;


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/generate-comment`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            code: code,
                            language: selectedLanguage
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Unable to generate comment."
                );
            }


            commentOutput.innerHTML = `
                <div class="generated-comment">
                    ${escapeHTML(data.comment || "")}
                </div>
            `;


        } catch (error) {

            console.error(
                "Generate Comment Error:",
                error
            );

            commentOutput.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Failed to connect to backend."
                        )}
                    </p>

                </div>
            `;

        } finally {

            generateBtn.disabled = false;

            generateBtn.textContent =
                "✨ Generate Comment";
        }

    }
);


/* =====================================================
   RUN CODE
===================================================== */

runBtn.addEventListener(
    "click",
    async () => {

        const code =
            codeInput.value.trim();

        const selectedLanguage =
            language.value;


        if (!code) {

            alert(
                "Please enter some code first."
            );

            return;
        }


        if (!selectedLanguage) {

            alert(
                "Please select a programming language."
            );

            return;
        }


        runBtn.disabled = true;

        runBtn.textContent =
            "⏳ Running...";

        executionStatus.textContent =
            "Running";

        terminalOutput.textContent =
            `Executing ${selectedLanguage} code...`;


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/run-code`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            code: code,
                            language: selectedLanguage
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Code execution failed."
                );
            }


            terminalOutput.textContent =
                data.output ||
                "Program executed successfully with no output.";

            executionStatus.textContent =
                "Success";


        } catch (error) {

            console.error(
                "Run Code Error:",
                error
            );

            terminalOutput.textContent =
                error.message ||
                "Failed to connect to backend.";

            executionStatus.textContent =
                "Error";

        } finally {

            runBtn.disabled = false;

            runBtn.textContent =
                "▶ Run Code";
        }

    }
);


/* =====================================================
   COPY
===================================================== */

copyBtn.addEventListener(
    "click",
    async () => {

        const comment =
            document.querySelector(
                ".generated-comment"
            );


        if (!comment) {

            alert(
                "Generate a comment first."
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                comment.textContent
            );

            copyBtn.textContent =
                "✓";


            setTimeout(
                () => {

                    copyBtn.textContent =
                        "📋";

                },
                1500
            );


        } catch (error) {

            console.error(
                "Copy Error:",
                error
            );

            alert(
                "Unable to copy comment."
            );
        }

    }
);


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   INITIALIZE
===================================================== */

updateLineNumbers();