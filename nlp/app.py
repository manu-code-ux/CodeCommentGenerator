import sys
import json

from comment_generator import generate_comment


def main():

    # Check whether code was provided

    if len(sys.argv) < 2:

        print(
            json.dumps({
                "success": False,
                "error": "No code provided."
            })
        )

        return


    # Get source code

    code = sys.argv[1]


    # Get language

    language = "python"

    if len(sys.argv) >= 3:

        language = sys.argv[2]


    # Generate NLP comment

    comment = generate_comment(
        code,
        language
    )


    # Prepare JSON response

    result = {

        "success": True,

        "comment": comment,

        "language": language

    }


    # Send JSON to Node.js

    print(
        json.dumps(result)
    )


if __name__ == "__main__":

    main()