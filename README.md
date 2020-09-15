# IPLabImageAccess
Convinient class for handling images in JavaScript.

## Overview
The `IPLabImageAccess` class has been developed for teaching the coding of Image Processing algorithms at the pixel level. The class is written in JavaScript and is intended to be used in [Jupyter Notebooks](https://jupyter.org/) running the [IJavascript](http://n-riesco.github.io/ijavascript/) kernel. However, it can also be used in a native JavaScript environment. The aim of the `IPLabImageAccess` class is to facilitate the creation and modification of images in JavaScript and as such it provides an easy-to-use interface to multidimensional arrays which can represent graylevel or color images, offering utility functions and pixel access, while taking care of boundary conditions.

## Main Features
* Creation of new color- or graylevel images from size and initial value parameters or from an existing JavaScript array
* Single-pixel _R/W_ access
* Row/Column _R/W_ access
* Neighborhood _R_ access
* Subimage _W_ access
* Easy access to image size and dimensionality
* Integrated minimum/maximum and normilize methods
* Transpose images
* Compare two images
* Conversion from image to JavaScript array

## Usage
To use the `IPLabImageAccess` class, use the `require` statement. It is recommended to import the class as a constant `Image` by using the following code
```javascript
const Image = require('IPLabImageAccess.js')
```
but it can also be imported as `var` instead of `const` to allow for multiple importations.

## Contributors
The class was developed in the most part by:
* Kay Lächler (kay.lachler@epfl.ch, [TheUser0571](https://github.com/TheUser0571))

under the guidance, help, testing and feedback of:
* Alejandro Noguerón Aramburu (alejandro.nogueronaramburu@epfl.ch, [Alejandro-1996](https://github.com/Alejandro-1996))
* [Pol del Aguila Pla](https://poldap.github.io), (pol.delaguilapla@epfl.ch, [poldap](https://github.com/poldap))
* [Daniel Sage](http://bigwww.epfl.ch/sage/index.html), (daniel.sage@epfl.ch, [dasv74](https://github.com/dasv74))

It was supported by EPFLs [Center for Digital Education (CEDE)](https://www.epfl.ch/education/educational-initiatives/cede/), and it belongs to the [Biomedical Imaging Group](http://bigwww.epfl.ch/).

## Documentation
A detailed documentation can be found in the [wiki](https://github.com/Biomedical-Imaging-Group/IPLabImageAccess/wiki).
