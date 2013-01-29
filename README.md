Spoke
=====

A project to upload and store audio and text of speeches.

Documentation
-------------
Documentation (a work in progress) can be found at: http://mysociety.github.com/spoke/develop/phonegap/

Site Installation
-----------------

Something like the following, customised to your particular environment or set
up:

    # Clone the repo
    mkdir spoke
    cd spoke
    git clone https://github.com/mysociety/spoke.git

    # Install the required software packages
    Assuming you're on a debian/ubuntu server:
    sudo xargs -a conf/packages apt-get install

    # Create a postgres database and user
    sudo -u postgres psql
    postgres=# CREATE USER spoke WITH password 'spoke';
    CREATE ROLE
    postgres=# CREATE DATABASE spoke WITH OWNER spoke;
    CREATE DATABASE

    # Set up a python virtual environment, activate it
    virtualenv --no-site-packages virtualenv-spoke
    source virtualenv-spoke/bin/activate

    # Install required python packages
    cd spoke
    pip install --requirement requirements.txt

    cp conf/general.yml-example conf/general.yml
    # Alter conf/general.yml as per your set up

    # Set up database
    ./manage.py syncdb

    # This will ask you if you wish to create a Django superuser, which you'll
    # use to access the spoke admin interface. You can always do it later with
    # ./manage.py createsuperuser, but there's no harm in doing it now either,
    # just remember the details you choose!

    ./manage.py migrate

    # gather all the static files in one place
    ./manage.py collectstatic --noinput

Site Testing
------------

    ./manage.py test speeches

The Selenium tests currently uses Firefox, so make sure you have Firefox
installed.

If you're on a headless server, eg: in a vagrant box, you'll need to install
the iceweasel and xvfb packages (see the commented out section of
/conf/packages)

After installing them, start Xvfb with:

    Xvfb :99 -ac &

And export your display variable:

    export DISPLAY=:99

You might want to make that happen at every startup with the appropriates
lines in `/etc/rc.local` and `~/.bashrc`

App
---
The mobile app uses Phonegap to run in Android and iOS. The main code can be
found in `phonegap/www` which is then symlinked into the right places from
`phonegap/android/assets` and `ios` for the Android and iOS versions
respectively. You should be able to open the Eclipse project in
`phonegap/android` or the XCode project in `ios/spoke.xcodeproj` to run the
app in the right simulator or on a connected device.

App Testing
-----------
Tests for the app can be found in `phonegap/www/spec.html` which you can just
open in your browser locally to run (they use Jasmine).