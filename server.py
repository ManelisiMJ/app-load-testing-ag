import os
from flask import Flask, jsonify, render_template, send_from_directory
from flask_cors import CORS, cross_origin

# Instantiate the server
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/images/<filename>')
@cross_origin()
def serve_image(filename):
    return send_from_directory('static/images', filename)

@app.route('/js/<filename>')
@cross_origin()
def serve_script(filename):
    return send_from_directory('static/js', filename)

@app.route('/load-test', methods=['GET'])
@cross_origin()
def loadTest():
    return jsonify({"code": 201})

@app.route('/', methods=['GET'])
@cross_origin()
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))
