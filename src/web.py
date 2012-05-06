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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    #app.jinja_loader = FileSystemLoader('templates')
    app.run(host='0.0.0.0', port=port, debug=True)
