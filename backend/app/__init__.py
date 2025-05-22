from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from .config import Config  # assuming you have a Config class for your settings

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # if your Config class contains SQLALCHEMY_DATABASE_URI etc.

    # Or if you want to configure directly here, do:
    # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bebetimedb.sqlite3'
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    CORS(app, supports_credentials=True)  # enable CORS globally

    # Register blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from app.routes.test import test_bp
    app.register_blueprint(test_bp, url_prefix='/api/test')

    from app.routes.rooms import rooms_bp
    app.register_blueprint(rooms_bp, url_prefix='/api/rooms')

    return app
