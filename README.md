c3po
===
#### Boulder building permit 2-way conversation project

### Tech Stack

**FrontEnd:**  Ember based JavaScript/HTML5/SASS  
**Application:**  Rails  
**Data:**  REST API to OpenDataPlus with integration to CityOfBoulder permit data / LafayettePermit  

### Getting Started
* Download and Install [Vagrant](http://docs.vagrantup.com/v2/installation/)
* Download and Install [Virtual Box](https://www.virtualbox.org/wiki/Downloads)
* Git clone this repository
  * Requires git 
    * MacOSX: you will need Xcode and Command Line Tools
    * Windows: Go here: <https://git-scm.com/downloads> and download and install
  * Then `git clone https://github.com/CodeForBoulder/c3po.git` 
* `cd c3po` or `dir c3po`
* run `vagrant up`
* when that's done running, `vagrant ssh`
* `$ rails server -b 0.0.0.0 -p 3000`
* open up your browser and navigate to <http://localhost:3001>

