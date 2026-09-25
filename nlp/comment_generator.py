import re


def generate_comment(code, language="python"):

    code = code.strip()

    if not code:
        return "No code was provided."

    language = language.lower().strip()

    comments = []

    # ==========================================
    # PYTHON
    # ==========================================

    if language == "python":

        # Functions
        functions = re.findall(
            r"def\s+([a-zA-Z_]\w*)\s*\((.*?)\)",
            code
        )

        for function_name, parameters in functions:

            parameters = parameters.strip()

            if parameters:
                comments.append(
                    f"The function '{function_name}' "
                    f"accepts parameters {parameters}."
                )
            else:
                comments.append(
                    f"The function '{function_name}' "
                    f"does not require any parameters."
                )

        # Variable assignments
        assignments = re.findall(
            r"^\s*([a-zA-Z_]\w*)\s*=\s*(.+)$",
            code,
            re.MULTILINE
        )

        if assignments:

            variable_names = [
                name for name, value in assignments
            ]

            comments.append(
                "The code defines variables: "
                + ", ".join(variable_names)
                + "."
            )

        # Addition
        if re.search(
            r"\w+\s*=\s*\w+\s*\+\s*\w+",
            code
        ):
            comments.append(
                "It performs an addition operation."
            )

        # Subtraction
        if re.search(
            r"\w+\s*=\s*\w+\s*-\s*\w+",
            code
        ):
            comments.append(
                "It performs a subtraction operation."
            )

        # Multiplication
        if re.search(
            r"\w+\s*=\s*\w+\s*\*\s*\w+",
            code
        ):
            comments.append(
                "It performs a multiplication operation."
            )

        # Division
        if re.search(
            r"\w+\s*=\s*\w+\s*/\s*\w+",
            code
        ):
            comments.append(
                "It performs a division operation."
            )

        # Print
        if re.search(
            r"\bprint\s*\(",
            code
        ):
            comments.append(
                "The program displays output using "
                "the print function."
            )

        # If
        if re.search(
            r"\bif\b",
            code
        ):
            comments.append(
                "The code uses a conditional statement "
                "to make a decision."
            )

        # Else
        if re.search(
            r"\belse\b",
            code
        ):
            comments.append(
                "An alternative block is executed "
                "when the condition is not satisfied."
            )

        # For
        if re.search(
            r"\bfor\b",
            code
        ):
            comments.append(
                "The code uses a for loop "
                "to repeat an operation."
            )

        # While
        if re.search(
            r"\bwhile\b",
            code
        ):
            comments.append(
                "The code uses a while loop "
                "for repeated execution."
            )

        # List
        if re.search(
            r"\[[^\]]*\]",
            code
        ):
            comments.append(
                "The code works with a list or "
                "collection of values."
            )

        # Return
        if re.search(
            r"\breturn\b",
            code
        ):
            comments.append(
                "The function returns a value "
                "to the calling code."
            )

        # Input
        if re.search(
            r"\binput\s*\(",
            code
        ):
            comments.append(
                "The program accepts input from the user."
            )

    # ==========================================
    # JAVA
    # ==========================================

    elif language == "java":

        # Class
        if re.search(
            r"\bclass\s+\w+",
            code
        ):
            comments.append(
                "The Java code defines a class."
            )

        # Main method
        if re.search(
            r"public\s+static\s+void\s+main\s*\(",
            code
        ):
            comments.append(
                "The program contains the main method "
                "which serves as the entry point."
            )

        # Variables
        java_variables = re.findall(
            r"\b(?:int|double|float|long|short|byte|boolean|char|String)\s+(\w+)\s*=",
            code
        )

        if java_variables:
            comments.append(
                "The code defines variables: "
                + ", ".join(java_variables)
                + "."
            )

        # Addition
        if re.search(
            r"\w+\s*=\s*\w+\s*\+\s*\w+",
            code
        ):
            comments.append(
                "It performs an addition operation."
            )

        # Subtraction
        if re.search(
            r"\w+\s*=\s*\w+\s*-\s*\w+",
            code
        ):
            comments.append(
                "It performs a subtraction operation."
            )

        # Multiplication
        if re.search(
            r"\w+\s*=\s*\w+\s*\*\s*\w+",
            code
        ):
            comments.append(
                "It performs a multiplication operation."
            )

        # Division
        if re.search(
            r"\w+\s*=\s*\w+\s*/\s*\w+",
            code
        ):
            comments.append(
                "It performs a division operation."
            )

        # Print
        if re.search(
            r"System\.out\.(?:println|print)\s*\(",
            code
        ):
            comments.append(
                "The program displays output using "
                "System.out."
            )

        # If
        if re.search(
            r"\bif\s*\(",
            code
        ):
            comments.append(
                "The code uses a conditional statement "
                "to make a decision."
            )

        # Else
        if re.search(
            r"\belse\b",
            code
        ):
            comments.append(
                "An alternative block is executed "
                "when the condition is not satisfied."
            )

        # For
        if re.search(
            r"\bfor\s*\(",
            code
        ):
            comments.append(
                "The code uses a for loop "
                "to repeat an operation."
            )

        # While
        if re.search(
            r"\bwhile\s*\(",
            code
        ):
            comments.append(
                "The code uses a while loop "
                "for repeated execution."
            )

        # Return
        if re.search(
            r"\breturn\b",
            code
        ):
            comments.append(
                "The method returns a value "
                "to the calling code."
            )

        # Scanner input
        if re.search(
            r"\bScanner\b|\.next(?:Int|Line|Double|Float)\s*\(",
            code
        ):
            comments.append(
                "The program accepts input from the user."
            )

    # ==========================================
    # JAVASCRIPT
    # ==========================================

    elif language in ("javascript", "js"):

        # Function
        if re.search(
            r"\bfunction\s+\w+\s*\(",
            code
        ) or re.search(
            r"=>",
            code
        ):
            comments.append(
                "The JavaScript code defines a function."
            )

        # Variables
        js_variables = re.findall(
            r"\b(?:let|const|var)\s+(\w+)\s*=",
            code
        )

        if js_variables:
            comments.append(
                "The code defines variables: "
                + ", ".join(js_variables)
                + "."
            )

        # Addition
        if re.search(
            r"\w+\s*=\s*\w+\s*\+\s*\w+",
            code
        ):
            comments.append(
                "It performs an addition operation."
            )

        # Subtraction
        if re.search(
            r"\w+\s*=\s*\w+\s*-\s*\w+",
            code
        ):
            comments.append(
                "It performs a subtraction operation."
            )

        # Multiplication
        if re.search(
            r"\w+\s*=\s*\w+\s*\*\s*\w+",
            code
        ):
            comments.append(
                "It performs a multiplication operation."
            )

        # Division
        if re.search(
            r"\w+\s*=\s*\w+\s*/\s*\w+",
            code
        ):
            comments.append(
                "It performs a division operation."
            )

        # Console output
        if re.search(
            r"console\.(log|error|warn)\s*\(",
            code
        ):
            comments.append(
                "The program displays output using "
                "the console."
            )

        # If
        if re.search(
            r"\bif\s*\(",
            code
        ):
            comments.append(
                "The code uses a conditional statement "
                "to make a decision."
            )

        # Else
        if re.search(
            r"\belse\b",
            code
        ):
            comments.append(
                "An alternative block is executed "
                "when the condition is not satisfied."
            )

        # For
        if re.search(
            r"\bfor\s*\(",
            code
        ):
            comments.append(
                "The code uses a for loop "
                "to repeat an operation."
            )

        # While
        if re.search(
            r"\bwhile\s*\(",
            code
        ):
            comments.append(
                "The code uses a while loop "
                "for repeated execution."
            )

        # Array
        if re.search(
            r"\[[^\]]*\]",
            code
        ):
            comments.append(
                "The code works with an array "
                "of values."
            )

        # Return
        if re.search(
            r"\breturn\b",
            code
        ):
            comments.append(
                "The function returns a value "
                "to the calling code."
            )

    # ==========================================
    # C++
    # ==========================================

    elif language in ("cpp", "c++"):

        # Main function
        if re.search(
            r"\bint\s+main\s*\(",
            code
        ):
            comments.append(
                "The C++ program contains the main "
                "function which serves as the entry point."
            )

        # Variables
        cpp_variables = re.findall(
            r"\b(?:int|double|float|long|char|bool|string)\s+(\w+)\s*=",
            code
        )

        if cpp_variables:
            comments.append(
                "The code defines variables: "
                + ", ".join(cpp_variables)
                + "."
            )

        # Addition
        if re.search(
            r"\w+\s*=\s*\w+\s*\+\s*\w+",
            code
        ):
            comments.append(
                "It performs an addition operation."
            )

        # Subtraction
        if re.search(
            r"\w+\s*=\s*\w+\s*-\s*\w+",
            code
        ):
            comments.append(
                "It performs a subtraction operation."
            )

        # Multiplication
        if re.search(
            r"\w+\s*=\s*\w+\s*\*\s*\w+",
            code
        ):
            comments.append(
                "It performs a multiplication operation."
            )

        # Division
        if re.search(
            r"\w+\s*=\s*\w+\s*/\s*\w+",
            code
        ):
            comments.append(
                "It performs a division operation."
            )

        # cout
        if re.search(
            r"\bcout\s*<<",
            code
        ):
            comments.append(
                "The program displays output using cout."
            )

        # cin
        if re.search(
            r"\bcin\s*>>",
            code
        ):
            comments.append(
                "The program accepts input using cin."
            )

        # If
        if re.search(
            r"\bif\s*\(",
            code
        ):
            comments.append(
                "The code uses a conditional statement "
                "to make a decision."
            )

        # Else
        if re.search(
            r"\belse\b",
            code
        ):
            comments.append(
                "An alternative block is executed "
                "when the condition is not satisfied."
            )

        # For
        if re.search(
            r"\bfor\s*\(",
            code
        ):
            comments.append(
                "The code uses a for loop "
                "to repeat an operation."
            )

        # While
        if re.search(
            r"\bwhile\s*\(",
            code
        ):
            comments.append(
                "The code uses a while loop "
                "for repeated execution."
            )

        # Array
        if re.search(
            r"\[[^\]]*\]",
            code
        ):
            comments.append(
                "The code works with an array "
                "of values."
            )

        # Return
        if re.search(
            r"\breturn\b",
            code
        ):
            comments.append(
                "The function returns a value "
                "to the calling code."
            )

    # ==========================================
    # UNSUPPORTED LANGUAGE
    # ==========================================

    else:

        return (
            f"Language '{language}' is not supported."
        )

    # ==========================================
    # REMOVE DUPLICATES
    # ==========================================

    unique_comments = []

    for comment in comments:

        if comment not in unique_comments:

            unique_comments.append(comment)

    # ==========================================
    # FINAL COMMENT
    # ==========================================

    if unique_comments:

        return " ".join(unique_comments)

    return (
        f"The {language} code contains programming "
        "statements that perform a specific "
        "computational task."
    )