from flask import Flask
from flask_cors import CORS
from config import Config
from flask_jwt_extended import JWTManager
from database import mongo

app = Flask(__name__)

# Allow frontend connection
CORS(app)

# Load configuration
app.config.from_object(Config)

# Initialize JWT
jwt = JWTManager(app)

# Initialize MongoDB
mongo.init_app(app)


# Import routes
from routes.auth import auth
from routes.tasks import task


# Register routes
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(task, url_prefix="/task")


@app.route("/")
def home():
    return "Student Task Manager Backend is Running!"
print(app.url_map)

if __name__ == "__main__":
    app.run(debug=True)