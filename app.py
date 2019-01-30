from flask import Flask, render_template, request, session
import json
import data_manager
import security


app = Flask(__name__)

app.secret_key = "_R€A-dO_cTa85%3(}Dwa4!'9aZl@@&ATzzUobB{@#<"


ERROR_USERNAME_OR_PASSWORD_WRONG = -1
ERROR_USERNAME_ALREADY_EXISTS = -2
ERROR_USERNAME_HAS_INVALID_CHARACTERS = -3
ERROR_INVALID_PASSWORD = -4
ERROR_NOT_LOGGED_IN = -5
SUCCESS_REGISTRATION = 1
SUCCESS_LOGOUT = 2


@app.route('/')
def index():
    return render_template('index.html', username=session.get("username"))


@app.route('/list-planets/')
def list_planets():
    page = 1
    if request.args:
        if request.args["page"]:
            page = int(request.args["page"])
    return render_template('list_planets.html', page=page, username=session.get("username"))


@app.route('/login/', methods=["POST"])
def login():
    user = data_manager.get_user_by_username(request.form["username"])
    if user:
        if security.verify_password(request.form["password"], user["password"]):
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            return json.dumps({"username": user["username"]})
    return json.dumps(ERROR_USERNAME_OR_PASSWORD_WRONG)


@app.route('/register/', methods=["POST"])
def register():
    if security.check_username_validity(request.form["username"]):
        if security.check_password_validity(request.form["password"]):
            if not data_manager.get_user_by_username(request.form["username"]):
                data_manager.save_new_user(request.form["username"], security.hash_password(request.form["password"]))
                if request.form["login"] == "true":
                    session["user_id"] = data_manager.get_user_by_username(request.form["username"])["id"]
                    session["username"] = request.form["username"]
                    return json.dumps({"username": request.form["username"]})
                else:
                    return json.dumps(SUCCESS_REGISTRATION)
            else:
                return json.dumps(ERROR_USERNAME_ALREADY_EXISTS)
        else:
            return json.dumps(ERROR_INVALID_PASSWORD)
    else:
        return json.dumps(ERROR_USERNAME_HAS_INVALID_CHARACTERS)


@app.route('/logout/')
def logout():
    print(session.get("user_id"))
    if session.get("user_id"):
        session.pop("user_id")
        session.pop("username")
        return json.dumps(SUCCESS_LOGOUT)
    return json.dumps(ERROR_NOT_LOGGED_IN)


if __name__ == '__main__':
    app.run()
