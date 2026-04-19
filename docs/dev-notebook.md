# Dev Notebook
### 4/10
- Nuked most of the base site to install the bones of the new site, including:
    - Home page
    - Comic page
    - Announcements page
    - Behind-the-Scenes page
    - Login page
    - Nav bar with functional links
### 4/13
- Contacted client about design choices and new domain name
- Added background
- Recolored nav bar
- Added endpoints pointing to each page
- Adjusted nav bar links to point to endpoints instead of files
### 4/14
- Added registration page
- Began work on user registration code
### 4/15
- Yoinked user registration/login code from freshly posted [demo](https://github.com/barrycumbie/full-stack-authn-example)
- Decided on an image host
- Somehow broke CSS and js when testing the site from anywhere but localhost
### 4/16
- Fixed CSS and JS files
    - Browser was reporting a MIME type mismatch error when it actually couldn't find the files at all because of a capitalization error
    - See the [wiki page](https://github.com/TuesdayB/turbo-system-devops/wiki/MIME-Type-Mismatch-Error) for further information
- Set up final domain name
-Re-issued SSL Certification for new domain
### 4/17
- Added admin panel
    - Only logged-in users with admin status can open the admin panel
- Removed behind-the-scenes page
- Implemented CREATE and READ for comics database (on Admin panel, not Comics HTML page. UPDATE and DELETE still in progess.)
- Note to self: Add reset form button on page editor form, as well as some indicator when you're currently updating an existing page
### 4/18
- Implemented UPDATE and DELETE for comic pages
- Added toggle buttons for viewing announcement and comic editors