# Import necessary modules
from PyPDF2 import PdfReader
import csv

# Class to handle file reading operations
class FileReader:
    
    # Method to get the file path for a given file name
    def get_file_path(self, file_name):
        result = 'audit-templates/' + file_name + '.csv'  # Construct the file path
        return result

    # Method to read a PDF file and extract its text
    def read_pdf_file(self, file) -> str:
        text = ""
        pdf_reader = PdfReader(file)  # Initialize the PDF reader with the file
        
        # Extract text from each page of the PDF
        for page in pdf_reader.pages:
            text += page.extract_text()

        return text

    # Method to read a CSV file and return its contents as a dictionary
    def read_csv_file(self, file_path):
        file_result = {}  # Dictionary to store the results
        domain = None
        questions_list = []

        current_domain = None
        current_question = None

        # Open and read the CSV file
        with open(file_path) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0

            # Iterate through each row in the CSV file
            for row in csv_reader:
                line_count += 1
                
                # Skip the header row
                if line_count == 1:
                    continue

                current_domain = row[0].strip()  # Read the domain from the first column
                current_question = row[1].strip()  # Read the question from the second column

                # If the current domain is empty, use the previous domain
                if not current_domain:
                    current_domain = domain
                else:
                    domain = current_domain
                    questions_list = []
                    file_result[domain] = questions_list  # Initialize a new list for the new domain

                questions_list.append(current_question)  # Add the question to the list

            print(f'Processed {line_count} lines.')

        return file_result
