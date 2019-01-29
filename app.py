from flask import Flask, render_template, request

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/list-planets/')
def list_planets():
    page = 1
    if request.args:
        if request.args["page"]:
            page = int(request.args["page"])
    return render_template('list_planets.html', page=page)


if __name__ == '__main__':
    app.run()
