# pmapper-pekanbaru-ms4w
GIS for Pekanbaru, based on p-mapper 4.3.2

Download or clone this repo into your MS4W

If you read this pmapper-pekanbaru-ms4w-README.md, I preassume
that you've installed pmapper-pekanbaru-ms4w into your MS4W.


# Working Demo
You can access your new pmapper-pekanbaru-ms4w WebGIS by
navigating your internet browser into

http://localhost/pekanbaru/


# Troubleshooting
If  you see nothing, may be you need to restart your 
apache service.

Open CMD with Administrator privilege then execute 
```
C:\MS4W\apache-restart.bat
```
or 

if you still see nothing, may be you need to remove MS4W
service first and then re-installing it.
```
C:\MS4W\apache-uninstall.bat
C:\MS4W\apache-install.bat
```

If you still see nothing in your 
http://localhost/pekanbaru/

make sure there is no HTTPD service listen on your port 80
Skype sometime listen on port 80 and 443.
Do you have IIS, WAMPP or XAMPP? Shut them off first!

# What is p.mapper?
If you're curious with p.mapper, you can download latest 
p.mapper on sf.net,

https://sourceforge.net/projects/pmapper/files/p.mapper%204/4.3.2/

