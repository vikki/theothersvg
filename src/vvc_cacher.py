#!/usr/bin/python
import urllib2
import urllib
import json
import re
from time import gmtime, strftime
import boto

def getVVCChart():
   VVC_CHART_JSON = 'http://viralvideochart.unrulymedia.com/all?format=app_json' 
   vvc_file = urllib2.urlopen(VVC_CHART_JSON)

   makeNewS3Key(vvc_file, 'current_vvc.json')

   vvc = json.load(vvc_file)
   
   return vvc

def getVideoRefFromYTUrl(ytUrl):
   VID_RE = 'www\.youtube\.com\/watch\?v=(.*)'
   res = re.search(VID_RE, ytUrl)
   if (res != None and res.groups() != () ):
      return res.groups()[0]
   else:
      return ''

def getYTVideo(videoRef):
   print "request for " + videoRef
   url = 'http://www.youtube.com/get_video_info?html5=1&video_id=' + videoRef + '&eurl=http%3A%2F%2F0.0.0.0%3A5000%2Ftest&el=embedded&hl=en_GB'
   vidFile = urllib2.urlopen(url)
   vidDets = vidFile.read()
   vidDets = urllib2.unquote(vidDets)

   vidRE = r'url_encoded_fmt_stream_map=url=([^&]*)&'

   vidUrl =  re.search(vidRE, vidDets).groups(0)[0]
   vidUrl = urllib2.unquote(vidUrl)

   print strftime("%H:%M:%S", gmtime()) +  " getting " + vidUrl 
   finalVid = urllib2.urlopen(vidUrl)
   #finalVid = urllib.urlretrieve(vidUrl)[0]
   print finalVid

   print strftime("%H:%M:%S", gmtime()) +  " done got " + vidUrl 
   mimeType = finalVid.info().getheader('Content-Type')
   #  use webm if can't get mime type from response?

   return finalVid

def makeNewS3Key(file, filename):
   # not exactly optimal. ahem
   # uses boto cfg set in /etc/boto or ~/.boto

   s3 = boto.connect_s3()
   bucket = s3.get_bucket('streaming.vikkiread.co.uk')
   key = bucket.new_key(filename)
   real_file = open('/tmp/feh', 'w')
   real_file.write(file.read())
   real_file = open('/tmp/feh', 'r')
   key.set_metadata('kitten', 'test')
   key.update_metadata({'Content-Type' : 'video/webm', 'Content-Disposition': 'inline'})
   key.set_contents_from_file(real_file)
   key.make_public()
   #key.set_acl('public-read')

vvc = getVVCChart()
for (entry in vvc['entries']):
  url = entry['hostingSiteUrl']
  ref = getVideoRefFromYTUrl(url) 
  ytVid = getYTVideo(ref)
  filename = ref + '.mp4'
  makeNewS3Key(ytVid, filename)

