# Importing Required Modules
import time
import os
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

    # Read form data
    client_name = request.form.get("ClientName_text", "")
    audit_year_end = request.form.get("AuditYearEnd_date", "")
    pwc_auditor_name = request.form.get("PwCAuditorName_text", "")
    additional_context = request.form.get("AdditionalContext_text", "")

    print(f"Received Client Name: {client_name}")
    print(f"Received Audit Year End: {audit_year_end}")
    print(f"Received PwC Auditor Name: {pwc_auditor_name}")
    print(f"Received additional context: {additional_context}")


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
        if filename.endswith('.pdf'):
            text = file_reader.read_pdf_file(file)
        elif filename.endswith('.txt'):
            text = file_reader.read_txt_file(file)
        elif filename.endswith('.docx'):
            text = file_reader.read_docx_file(file)
        elif filename.endswith('.xlsx'):
            text = file_reader.read_xlsx_file(file)
        elif filename.endswith('.csv'):
            text = file_reader.read_csv_file(file)
        # elif filename.endswith('.doc'):
        #     # Save .doc file temporarily to disk to use win32com for reading
        #     temp_file_path = os.path.join('temp', filename)
        #     file.save(temp_file_path)
        #     text = file_reader.read_doc_file(temp_file_path)
        #     os.remove(temp_file_path)  # Clean up temporary file
        else:
            continue  # Skip unsupported file types
        
        merged_text += text
        texts_with_filenames.append((text, filename))

    # Call method from AuditLLM to read the audit template and generate responses based on the merged text
    answer_list = audit_llm.read_template_generate_result(texts_with_filenames=texts_with_filenames, program='Change Management',  additional_context=additional_context,
        client_name=client_name,
        audit_year_end=audit_year_end,
        pwc_auditor_name=pwc_auditor_name)
    findings = audit_llm.generate_findings(text=merged_text, answer_list=answer_list)

    # Return a JSON response containing the audit answers and findings
    response = {"message": answer_list, "findings": findings}
    
    
    return response

# Start the Flask application on port 8000 with debug mode enabled
if __name__ == "__main__":
    app.run(port=8000, debug=True)
