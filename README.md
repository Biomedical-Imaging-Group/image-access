# IPLabImageAccess

# Description
The `IPLabImageAccess` class provides an interface to multidimensional arrays in JavaScript which represent graylevel or colour images. It provides utility functions and easy pixel access. For this documentation it is assumed, for simplicity and readability, that the `IPLabImageAccess` will be imported as 
```javascript 
const Image = require('IPLabImageAccess.js')
```
which is why `IPLabImageAccess` will be replaced by `Image` for the rest of the documentation.

# Contents
* [Constructor](#constructor)
* [Attributes](#attributes)
* [Static methods](#static_methods)
* [Prototypical methods](#prot_methods)

# <a name="constructor"></a> Constructor

An `Image` object can either be instantiated with
```javascript
var img = Image(height, width);
```
which will create a new `Image` object of dimensions `height`x`width` or with
```javascript
var img = Image(height, width, {rgb:true});
```
wich will create a new `Image` object of dimensions `height`x`width`x`3` when `rgb` is set to `true`.<br>
Optionally `height` and `width` can be provided as an array `[height, width]` which makes it easy to create an image with the same dimensions as an existing image by using the [`shape`](#shape_) method
```javascript
var img = Image(an_existing_image.shape());
```
By default the image is initialized to `0` for every pixel, but we can prvide an alternative initialization value by specifying the `init_value` parameter while instatiating a new `Image` object
```javascript
var img = Image(height, width, {init_value:255});
```
When using both optional arguments `rgb` and `init_value`, they need to be grouped in the same optional object
```javascript
var img = Image(height, width, {rgb:true, init_value:255});
```
An `Image` object can also be instatiated from an existing JavaScript array by passing it to the constructor
```javascript
var img = Image(an_existing_array);
```
Or finally, an empty image can be declared and afterwards be initialized with an existing array using the [`fromArray`](#fromArray) method.
<a name="fromArrayUsage"></a>
```javascript
var img = Image();
img.fromArray(some_existing_array);
```

# <a name="attributes"></a> Attributes
* `image` : The actual image which is represented as a multidimensional array
* `nx` : The horizontal size of the image
* `ny` : The vertical size of the image

# <a name="static_methods"></a> Static Methods
Static methods can be used without instantiating a class object and can be applied to any type of array.

* [`Image.arrayCompare`](#arrayCompare)
* [`Image.getMax`](#getMax)
* [`Image.getMin`](#getMin)
* [`Image.getNbh`](#getNbh)
* [`Image.min`](#min)
* [`Image.MultidimArray`](#MdA)
* [`Image.ndims`](#ndims)
* [`Image.shape`](#shape)
* [`Image.transpose`](#transpose)

## <a name="arrayCompare"></a> Image.arrayCompare
Image.arrayCompare(a1, a2, tol=1e-5)
* Compares two arrays.

**Parameters:**
* **a1 (multidimensional array)** : First array to compare
* **a1 (multidimensional array)** : Second array to compare
* **tol (scalar)** : the tolerance to use in the comparison between each element

**Returns:**
* **output (boolean)** : `true` if the arrays are the same, `false` if not

**See also:** [imageCompare](#imageCompare)

## <a name="getMax"></a> Image.getMax
Image.getMax(arr)
* Returns the maximum value of an arbitrarily-sized array.

**Parameters:**
* **arr (multidimensional array)** : The array from which the maximum will be extracted.

**Returns:**
* **max_value (scalar)** : Maximum value of the input array

**See also:** [getMax](#getMax_)

## <a name="getMin"></a> Image.getMin
Image.getMin(arr)
* Returns the minimum value of an arbitrarily-sized array.

**Parameters:**
* **arr (multidimensional array)** : The array from which the minimum will be extracted.

**Returns:**
* **min_value (scalar)** : Minimum value of the input array

**See also:** [getMin](#getMin_)

## <a name="getNbh"></a> Image.getNbh
Image.getNbh(img, x_pos, y_pos, nx, ny, padding='mirror')
* Returns the `nx`x`ny` neighbourhood around position (`x_pos`, `y_pos`) of the input array

**Parameters:**
* **img (2D or 3D array)** : The array from which the neighbourhood will be extracted.
* **x_pos (integer scalar)** : The x position where the neighbourhood should be extracted
* **y_pos (integer scalar)** : The y position where the neighbourhood should be extracted
* **nx (integer scalar)** : The width of the neighbourhood
* **ny (integer scalar)** : The height of the neighbourhood
* **padding (string)** : The type of padding that should be applied when extracting regions that are outside the image. Default is `'mirror'`, which mirrors the image on its edges; `'repeat'` will repeat the image on its edges; `'zero'` will return '0' for pixels that are outside the image.

**Returns:**
* **nbh (2D or 3D array)** : The neighbourhood around the specified location

**Examples:**<br>
To get the zero-padded 5 by 5 neighbourhood around position (3,7) of `image` we use
```javascript
var nbh_5x5 = Image.getNbh(image, 3, 7, 5, 5, padding='zero');
```

**See also:** [getNbh](#getNbh_)

The effect of the different padding styles are given below:

<a name="paddingStyles"> </a>
**zero-padding** | **mirror-folding** | **repeat-folding**
-----------------|--------------------|-------------------
[[/images/getNbh_zero.png]]|[[/images/getNbh_mirror.png]]|[[/images/getNbh_repeat.png]]

## <a name="min"></a> Image.min
Image.min(a, b)
* Calculates the minimum between two graylevel- and/or colour pixels. If one of the pixels is an rgb pixel, the return value will be an rgb pixel.

**Parameters:**
* **a (scalar or 1D array with 3 color channels)** : First pixel
* **b (scalar or 1D array with 3 color channels)** : Second pixel

**Returns:**
* **ouput (scalar or 1D array with 3 color channels)** : Minimum of the two input pixels. For rgb pixels, each channel is calculated independently.

## <a name="MdA"></a> Image.MultidimArray
Image.MultidimArray(init_value, height, width, depth)
* Creates a multidimensional array based on the given input parameters. Unused dimensions should be left out.

**Parameters:**
* **init_value (scalar)** : Every element of the array will be initialized to this value
* **height (integer scalar)** : The height of the array (y direction)
* **width (integer scalar)** : The width of the array (x direction)
* **depth (integer scalar)** : The depth of the array (z direction) also called channels in images

**Returns:**
* **ouput (1D/2D/3D array)** : Multidimensional array with dimensions according to the input parameters and initialized to `init_value`

**Examples:**<br>
To create a 1D array filled with zeros of length 100 we use
```javascript
var arr_1d = Image.MultidimArray(0, 100);
```
To create a 2D array filled with zeros of size 100x100 we use
```javascript
var arr_2d = Image.MultidimArray(0, 100, 100);
```
which could potentially represent a grayscale image of 100 by 100 pixels.

To create a 3D array filled with 255s of size 100x100x3 we use
```javascript
var arr_3d = Image.MultidimArray(255, 100, 100, 3);
```
which could potentially represent a colour image of 100 by 100 pixels.

## <a name="ndims"></a> Image.ndims
Image.ndims(arr)
* Returns the dimensionality of a given array

**Parameters:**
* **arr (multidimensional array)** : The array of which we want to know the dimensionality

**Returns:**
* **ndims (scalar)** : Scalar indicating the number of dimensions

**See also:** [ndims](#ndims_)

## <a name="shape"></a> Image.shape
Image.shape(arr)
* Returns the shape of a given array

**Parameters:**
* **arr (multidimensional array)** : The array of which we want to know the shape

**Returns:**
* **shape (1D array)** : 1D array containing the number of elements in each dimension (height, width, depth/channels, additional dimensions...)

**See also:** [shape](#shape_)

## <a name="transpose"></a> Image.transpose
Image.transpose(array)
* Returns transpose of the input array.

**Parameters:**
* **array(2D or 3D array)** : The array that should be transposed

**Returns:**
* **output(2D or 3D array)** : The transposed input array

**See also:** [transposeImage](#transpose_)

# <a name="prot_methods"></a> Prototypical methods
Prototypical methods have to be called from an instantiated `Image` object and are usually applied to the `Image` object itself.

* [`copy`](#copy)
* [`fromArray`](#fromArray)
* [`getColumn`](#getColumn_)
* [`getMax`](#getMax_)
* [`getMin`](#getMin_)
* [`getNbh`](#getNbh_)
* [`getPixel`](#getPixel)
* [`getRow`](#getRow_)
* [`imageCompare`](#imageCompare)
* [`ndims`](#ndims_)
* [`normalize`](#normalize_)
* [`getColumn`](#getColumn_)
* [`putRow`](#putRow_)
* [`putSubImage`](#putSubImage_)
* [`setPixel`](#setPixel)
* [`shape`](#shape_)
* [`sort`](#sort)
* [`toArray`](#toArray)
* [`transposeImage`](#traspose_)

## <a name="copy"></a> copy
copy()
* Returns a copy of the `Image` object

**Returns:**
* **copy (Image object)** : A copy of the `Image` object this is called from.

## <a name="fromArray"></a> fromArray
fromArray(arr)
* Initializes an `Image` object from a given array as described [here](#fromArrayUsage).

**Parameters:**
* **arr (2D array or 3D array with 3 channels)** : An array containing image information

## <a name="getMax_"></a> getMax
getMax()
* Returns the maximum value of the image

**Returns:**
* **output (scalar)** : The maximum value of the image

**See also** : [Image.getMax](#getMax)

## <a name="getMin_"></a> getMin
getMin()
* Returns the minimum value of the image

**Returns:**
* **output (scalar)** : The minimum value of the image

**See also** : [Image.getMin](#getMin)

## <a name="getNbh_"></a> getNbh
getNbh(x_pos, y_pos, nx, ny, padding='mirror')
* Returns the `nx`x`ny` neighbourhood around position (`x_pos`, `y_pos`) of the image

**Parameters:**
* **x_pos (integer scalar)** : The x position where the neighbourhood should be extracted
* **y_pos (integer scalar)** : The y position where the neighbourhood should be extracted
* **nx (integer scalar)** : The width of the neighbourhood
* **ny (integer scalar)** : The height of the neighbourhood
* **padding (string)** : The type of padding that should be applied when extracting regions that are outside the image. Default is `'mirror'`, which mirrors the image on its edges; `'repeat'` will repeat the image on its edges; `'zero'` will return '0' for pixels that are outside the image.

**Returns:**
* **nbh (Image object)** : A new `Image` object containing the neighbourhood around the specified location

**Examples:**<br>
To get the zero-padded 5 by 5 neighbourhood around position (3,7) of the `Image` object `img` we use
```javascript
var nbh_5x5 = img.getNbh(3, 7, 5, 5, padding='zero');
```

**See also:** [Image.getNbh](#getNbh)

A representation of the different padding styles is given [here](#paddingStyles).

## <a name="getPixel"></a> getPixel
getPixel(x, y, padding='mirror')
* Returns the pixel at location (x,y)

**Parameters:**
* **x (integer scalar)** : x position of the pixel
* **y (integer scalar)** : y position of the pixel
* **padding (optional)(string)** : The type of padding which should be applied when accessing an out of bounds pixel. Default is 'mirror', other padding possibilities are shown [here](#paddingStyles).

**Returns:**
* **pixel (scalar or 1D array)** : The pixel at location (x,y) of the image as a scalar for grayscale images or 3 values in a 1D array for colour images

## <a name="imageCompare"></a> imageCompare
imageCompare(newImage, tol=1e-5)
* Compares two images

**Parameters:**
* **newImage (2D or 3D(with 3 channels) array)** : The image to which the object will be compared to
* **tol (scalar)** : the tolerance to use in the comparison between each pixel

**Returns:**
* **output (boolean)** : `true` if the images are the same, `false` if not

**See also:** [Image.arrayCompare](#arrayCompare)

## <a name="ndims_"></a> ndims
ndims()
* Returns the dimensionality of the image

**Returns:**
* **output (scalar)** : The number of dimensions of the image (`1` if empty, `2` if grayscale, `3` if colour)

**See also:** [Image.ndims](#ndims)

## <a name="setPixel"></a> setPixel
setPixel(x, y, value, padding='mirror')
* Set the pixel at location (`x`,`y`) to value `value`

**Parameters:**
* **x (integer scalar)** : x position of the pixel
* **y (integer scalar)** : y position of the pixel
* **value (scalar or 1D array with 3 channels)** : pixel value to set
* **padding (optional)(string)** : The type of padding which should be applied when accessing an out of bounds pixel. Default is 'mirror', other padding possibilities are shown [here](#paddingStyles). Zero-padding cannot be applied to `setPixel`.

**Examples:**
To set the pixel of a grayscale image `img_gray` at location (2,5) to 1 we use
```javascript
img_gray.setPixel(2, 5, 1);
```
To set the pixel of a colour image `img_colour` at location (215,512) to blue ([0, 0, 255]) we use
```javascript
img_colour.setPixel(215, 512, [0, 0, 255]);
```

## <a name="shape_"></a> shape
shape()
* Returns the shape of the image

**Returns:**
* **shape (1D array)** : 1D array containing the number of elements in each dimension (height, width, channels)

**See also:** [Image.shape](#shape)

## <a name="sort"></a> sort
sort(b)
* Returns a sorted array (in ascending order) of the pixel values.

**Parameters:**
* **b (optional) (Image object)** : Structuring element defining which pixels are used from the image. Set the pixels that should be used to `1` or `true`. When none is given, all pixels are used.

**Returns:**
* **ouput(1D/2D array)** : The sorted array. For grayscale images this is a 1D array. For colour images this is a 2D array, containing one sorted array per color channel.

**Examples:**<br>
Accessing the 2nd smallest value of a grayscale image
```javascript
var sorted = grayscale_image.sort();
var second_smallest_value = sorted[1];
```
For colour images 3 arrays are returned, one for each color channel
```javascript
var sorted = colour_image.sort();
var red_sorted = sorted[0];
var green_sorted = sorted[1];
var blue_sorted = sorted[2];
```
then we can access the 5th smallest value of the blue colour channel
```javascript
var fifth_smallest_blue_value = blue_sorted[4];
```
Optionally, a structuring element can be defined to indicate the pixels that should be used. For example we could have a 3 by 3 neighbourhood of some image and we only want to use the corners of this neighbourhood and get them as a sorted array. First we define the structuring element as an `Image` object with size 3x3, which will be initialized to `0` everywhere
```javascript
var structuring_element = new Image(3, 3);
```
then we can set the pixels of the structuring element to 1, which we want to use for the sorting. In our case just the corners
```javascript
structuring_element.setPixel(0, 0, 1); // upper left corner
structuring_element.setPixel(0, 2, 1); // upper right corner
structuring_element.setPixel(2, 0, 1); // lower left corner
structuring_element.setPixel(2, 2, 1); // lower right corner
```
finally we pass the structuring element to the sort function, when calling it on `nbh` that should be sorted
```javascript
var sorted = nbh.sort(structuring_element);
```
`sorted `is now a sorted array consisting of the corners of `nbh`.

## <a name="toArray"></a> toArray
toArray()
* Returns the image as a 2D/3D array, which is needed to convert the image to python

**Returns:**
* **output (2D/3D array)** : the image as a 2D/3D array

**Examples:**<br>
In JavaScript, we instantiate a new `Image` object from an existing array
```javascript
var img = new Image(an_existing_array);
```
After modifying the `Image` object using the utility functions provided by the `Image` class, we convert it back to an array
```javascript
var img_array = img.toArray();
```
which can then be imported to python as explained [here](https://github.com/poldap/IPLABs2020/wiki/Using-the-JavaScript-subkernel-within-SoS-notebooks#exchanging-variables-between-python-and-javascript).

## <a name="normalize_"></a> normalize
normalize()
* Returns the image with its range normalized to the range [0,1]

**Returns:**
* **output (`Image` object)** : The normalized image

## <a name="getRow_"></a> getRow
getRow(y, padding='mirror')
* Returns the y'th row of the image.

**Parameters:**
* **y (integer scalar)** : The row to be extracted
* **padding (string)** : The type of padding that should be applied when extracting regions that are outside the image. Default is `'mirror'`, which mirrors the image on its edges; `'repeat'` will repeat the image on its edges; `'zero'` will return '0' for pixels that are outside the image.

**Returns:**
* **row (1D array)** : The row at position y

**See also:** [getColumn](#getColumn_), [putRow](#putRow_)

## <a name="getColumn_"></a> getColumn
getColumn(x, padding='mirror')
* Returns the x'th column of the image.

**Parameters:**
* **x (integer scalar)** : The column to be extracted
* **padding (string)** : The type of padding that should be applied when extracting regions that are outside the image. Default is `'mirror'`, which mirrors the image on its edges; `'repeat'` will repeat the image on its edges; `'zero'` will return '0' for pixels that are outside the image.

**Returns:**
* **col (1D array)** : The column at position x

**See also:** [getRow](#getRow_), [putRow](#putRow_)

## <a name="putRow_"></a> putRow
putRow(y, new_row)
* Inserts `new_row` into the y'th row.

**Parameters:**
* **y (integer scalar)** : Where the row should be inserted
* **new_row(1D array)** : The row which should be inserted

**See also:** [getRow](#getRow_), [putColumn](#putColumn_)

## <a name="putColumn_"></a> putColumn
putColumn(x, new_column)
* Inserts `new_column` into the x'th column.

**Parameters:**
* **x (integer scalar)** : Where the column should be inserted
* **new_column(1D array)** : The column which should be inserted

**See also:** [getRow](#getRow_), [putRow](#putRow_)

## <a name="transpose_"></a> transposeImage
transposeImage()
* Transposes the image.

**See also:** [Image.transpose](#transpose)

## <a name="putSubImage_"></a> putSubImage
putSubImage(x, y, img)
* Inserts the sub-image `img` at location (`x`,`y`) into the image.

**Parameters:**
* **x(integer scalar)** : The x position of the top-left corner where the sub-image should be inserted
* **y(integer scalar)** : The y position of the top-left corner where the sub-image should be inserted
* **img(`Image` object)** : The sub-image that should be inserted
