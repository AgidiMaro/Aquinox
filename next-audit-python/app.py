# Importing Required Modules
import time
from flask import Flask, request
from flask_restful import Api
from flask_cors import CORS
from dotenv import load_dotenv
import json
from auditllm import AuditLLM
from filereader import FileReader

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for the app
api = Api(app)  # Initialize Flask-RESTful API
load_dotenv()  # Load environment variables from a .env file

# Instantiate the file reader and audit LLM helper classes
file_reader = FileReader()
audit_llm = AuditLLM(file_reader=file_reader)

# Define a GET route for a simple health check
@app.route('/ping', methods=['GET'])
def ping():
    return {"message": "ping"}

# Define a route for file upload and processing them for documentation
@app.route('/upload', methods=['POST'])
def upload():
    uploaded_files = []
    file_names = []

    # Checks if the useSample checkbox field is selected, and if so, loads a sample JSON response.
    if request.form.get('useSample') is not None:
        with open('sample-responses/LogicalAccess.json') as f:
            response = json.load(f)
        time.sleep(2)
        return response

    # Collect files from "PolicyDoc", "MeetingNote", and "OtherFiles" fields and their filenames
    if request.files.getlist("PolicyDoc"):
        for file in request.files.getlist("PolicyDoc"):
            uploaded_files.append(file)
            file_names.append(file.filename)

    if request.files.getlist("MeetingNote"):
        for file in request.files.getlist("MeetingNote"):
            uploaded_files.append(file)
            file_names.append(file.filename)

    if request.files.getlist("OtherFiles"):
        for file in request.files.getlist("OtherFiles"):
            uploaded_files.append(file)
            file_names.append(file.filename)

    merged_text = ""
    texts_with_filenames = []

    # Read and merge the content of uploaded files, associating text with filenames
    for file, filename in zip(uploaded_files, file_names):
        text = file_reader.read_pdf_file(file)
        merged_text += text
        texts_with_filenames.append((text, filename))

    # Call method from AuditLLM to read the audit template and generate responses based on the merged text
    answer_list = audit_llm.read_template_generate_result(texts_with_filenames=texts_with_filenames, program='Change Management')
    findings = audit_llm.generate_findings(text=merged_text, answer_list=answer_list)

    # Return a JSON response containing the audit answers and findings
    response = {"message": answer_list, "findings": findings}
    return response

# Start the Flask application on port 8000 with debug mode enabled
if __name__ == "__main__":
    app.run(port=8000, debug=True)
