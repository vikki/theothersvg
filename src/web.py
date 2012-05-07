#!/usr/bin/python
import flask
from flask import Flask, request, redirect, render_template
import urllib2
import os
from jinja2 import FileSystemLoader

app = Flask(__name__, static_folder='../static', template_folder='../templates')

@app.route("/")
def securityProxyForHTML():
  return render_template('vixgl.html')

@app.route("/html")
def foo():
    thing = request.args.get('html', 'http://viralvideochart.unrulymedia.com/all?format=app_json');
    img = urllib2.urlopen(thing)
    return flask.send_file(img, 'text/html')

@app.route("/kitty")
def kitty():
    thing = request.args.get('img', "http://i.ytimg.com/vi/Y4MnpzG5Sqc/hqdefault.jpg")
    img = urllib2.urlopen(thing)
    return flask.send_file(img, 'image/jpg')

@app.route("/vid")
def yo():
    thing = request.args.get('vid', "http://www.glge.org/demos/videodemo/bunny.ogg");
    img = urllib2.urlopen(thing)
    return flask.send_file(img, 'video/webm')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    #app.jinja_loader = FileSystemLoader('templates')
    app.run(host='0.0.0.0', port=port, debug=True)
