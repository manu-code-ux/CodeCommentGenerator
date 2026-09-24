import re


def generate_comment(code, language="python"):

    code = code.strip()

    if not code:
        return "No code was provided."


    comments = []


    # ==========================================
    # PYTHON FUNCTION
    # ==========================================

    functions = re.findall(
        r"def\s+([a-zA-Z_]\w*)\s*\((.*?)\)",
        code
    )

    for function_name, parameters in functions:

        parameter_text = parameters.strip()

        if parameter_text:

            comments.append(
                f"The function '{function_name}' "
                f"accepts parameters {parameter_text}."
            )

        else:

            comments.append(
                f"The function '{function_name}' "
                f"does not require any parameters."
            )


    # ==========================================
    # VARIABLE ASSIGNMENTS
    # ==========================================

    assignments = re.findall(
        r"^\s*([a-zA-Z_]\w*)\s*=\s*(.+)$",
        code,
        re.MULTILINE
    )

    if assignments:

        variable_names = [
            name
            for name, value in assignments
        ]

        comments.append(
            "The code defines variables: "
            + ", ".join(variable_names)
            + "."
        )


    # ==========================================
    # ADDITION
    # ==========================================

    if re.search(
        r"\w+\s*=\s*\w+\s*\+\s*\w+",
        code
    ):

        comments.append(
            "It performs an addition operation."
        )


    # ==========================================
    # SUBTRACTION
    # ==========================================

    if re.search(
        r"\w+\s*=\s*\w+\s*-\s*\w+",
        code
    ):

        comments.append(
            "It performs a subtraction operation."
        )


    # ==========================================
    # MULTIPLICATION
    # ==========================================

    if re.search(
        r"\w+\s*=\s*\w+\s*\*\s*\w+",
        code
    ):

        comments.append(
            "It performs a multiplication operation."
        )


    # ==========================================
    # DIVISION
    # ==========================================

    if re.search(
        r"\w+\s*=\s*\w+\s*/\s*\w+",
        code
    ):

        comments.append(
            "It performs a division operation."
        )


    # ==========================================
    # PRINT
    # ==========================================

    if re.search(
        r"\bprint\s*\(",
        code
    ):

        comments.append(
            "The program displays output using "
            "the print function."
        )


    # ==========================================
    # IF CONDITION
    # ==========================================

    if re.search(
        r"\bif\b",
        code
    ):

        comments.append(
            "The code uses a conditional statement "
            "to make a decision."
        )


    # ==========================================
    # ELSE
    # ==========================================

    if re.search(
        r"\belse\b",
        code
    ):

        comments.append(
            "An alternative block is executed "
            "when the condition is not satisfied."
        )


    # ==========================================
    # FOR LOOP
    # ==========================================

    if re.search(
        r"\bfor\b",
        code
    ):

        comments.append(
            "The code uses a for loop "
            "to repeat an operation."
        )


    # ==========================================
    # WHILE LOOP
    # ==========================================

    if re.search(
        r"\bwhile\b",
        code
    ):

        comments.append(
            "The code uses a while loop "
            "for repeated execution."
        )


    # ==========================================
    # LIST
    # ==========================================

    if re.search(
        r"\[[^\]]*\]",
        code
    ):

        comments.append(
            "The code works with a list or "
            "collection of values."
        )


    # ==========================================
    # RETURN
    # ==========================================

    if re.search(
        r"\breturn\b",
        code
    ):

        comments.append(
            "The function returns a value "
            "to the calling code."
        )


    # ==========================================
    # INPUT
    # ==========================================

    if re.search(
        r"\binput\s*\(",
        code
    ):

        comments.append(
            "The program accepts input from the user."
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
        "The code contains programming statements "
        "that perform a specific computational task."
    )