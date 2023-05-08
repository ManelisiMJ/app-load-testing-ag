import os
from flask import Flask, jsonify, render_template, request, send_from_directory
from flask_cors import CORS, cross_origin

# Instantiate the server
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)

@app.route('/js/<filename>')
def serve_script(filename):
    return send_from_directory('static/js', filename)

@app.route('/load_test', methods=['GET'])
def loadTest():
    return "Test API endpoint"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))
