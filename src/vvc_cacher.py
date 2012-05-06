#!/usr/bin/python
import urllib2
import urllib
import json
import re
import boto

def getVVCChart():
   VVC_CHART_JSON = 'http://viralvideochart.unrulymedia.com/all?format=app_json' 
   vvc_file = urllib2.urlopen(VVC_CHART_JSON)

   makeNewS3Key(vvc_file, 'current_vvc.json')

   
   vvc_file = urllib2.urlopen(VVC_CHART_JSON)
   print vvc_file
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

   print " getting " + vidUrl 
   finalVid = urllib2.urlopen(vidUrl)
   print finalVid

   print " done got " + vidUrl 
   mimeType = finalVid.info().getheader('Content-Type')

   return finalVid

def makeNewS3Key(file, filename):
   # not exactly optimal. ahem
   # uses boto cfg set in /etc/boto or ~/.boto
   # or the heroku config AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY 

   s3 = boto.connect_s3()
   bucket = s3.get_bucket('streaming.vikkiread.co.uk')
   if bucket.get_key(filename) != None:
      print  "already got " + filename
      return
   key = bucket.new_key(filename)
   real_file = open('/tmp/feh', 'w')
   real_file.write(file.read())
   real_file = open('/tmp/feh', 'r')
   key.update_metadata({'Content-Type' : 'video/webm', 'Content-Disposition': 'inline'})
   key.set_contents_from_file(real_file)
   key.make_public()

   # put stuff back so we can keep using it  
   # todo think about this properly!!! is weird
   print key

print "getting vvc"
vvc = getVVCChart()
print "got vvc"
for entry in vvc['entries']:
  print entry

  url = entry['hostingSiteUrl']
  ref = getVideoRefFromYTUrl(url) 

  thumbnailUrl = entry['thumbnailUrl']
  print thumbnailUrl
  thumb = urllib2.urlopen(thumbnailUrl)
  
  thumbFile = ref + '.jpg'
  makeNewS3Key(thumb, thumbFile)


  ytVid = getYTVideo(ref)
  vidFile = ref + '.mp4'
  makeNewS3Key(ytVid, vidFile)


print "done :D"

