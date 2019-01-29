from flask import Flask, render_template, redirect

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/list-planets')
def list_planets():
    return render_template('list_planets.html')


if __name__ == '__main__':
    app.run()
