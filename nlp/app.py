import sys
import json

from comment_generator import generate_comment


def main():

    # ==========================================
    # CHECK INPUT
    # ==========================================

    if len(sys.argv) < 3:

        print(
            json.dumps({
                "success": False,
                "error": "Code and language are required."
            })
        )

        return


    # ==========================================
    # GET CODE
    # ==========================================

    code = sys.argv[1]

    # ==========================================
    # GET LANGUAGE
    # ==========================================

    language = sys.argv[2]


    # ==========================================
    # GENERATE COMMENT
    # ==========================================

    comment = generate_comment(
        code,
        language
    )


    # ==========================================
    # PREPARE RESPONSE
    # ==========================================

    result = {

        "success": True,

        "comment": comment,

        "language": language

    }


    # ==========================================
    # SEND JSON RESPONSE
    # ==========================================

    print(
        json.dumps(result)
    )


if __name__ == "__main__":

    main()