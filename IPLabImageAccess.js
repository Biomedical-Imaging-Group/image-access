class IPLabImageAccess{
    // initializes a new blank image
    constructor(height, width = {}, {rgb=false, init_value=0} = {}){
        if(typeof(height) == 'undefined'){
            return;
        }else if(IPLabImageAccess.ndims(height) == 0){
            // use height and width seperately
            if(!rgb){
                this.image = IPLabImageAccess.MultidimArray(init_value, height, width);
            }else{
                this.image = IPLabImageAccess.MultidimArray(init_value, height, width, 3);
            }
        }else if(IPLabImageAccess.ndims(height) == 1 && (height.length == 2 || height.length == 3)){
			// redefine optional parameters
			rgb = width.rgb || false;
			init_value = width.init_value || 0;
            // height and width given as a an array
            if(rgb || (height.length == 3 && height[2] == 3)){
                this.image = IPLabImageAccess.MultidimArray(init_value, height[0], height[1], 3);
            }else{
                this.image = IPLabImageAccess.MultidimArray(init_value, height[0], height[1]);
            }
        }else if(IPLabImageAccess.ndims(height) == 2 || IPLabImageAccess.ndims(height) == 3){
            // initialize from array
            this.fromArray(height);
        }else{
            throw new Error("Unrecognized input data in IPLabImageAccess constructor");
        }
        // assign image sizes
        this.nx = this.shape()[1];
        this.ny = this.shape()[0];
    }
    
    // gets the image from a provided array
    fromArray(arr){
		// get image shape and nb of dimensions
        var im_shape = IPLabImageAccess.shape(arr)
        var im_dims = IPLabImageAccess.ndims(arr)
		// check that the image is 2D or 3D
        if(im_dims != 2 && im_dims != 3){
            throw new Error("Please provide a 2D or 3D array.");
        }
		// check that the color image has 3 channels
        if(im_dims == 3 && im_shape[2] != 3){
            throw new Error("3D arrays should contain 3 color channels, not " + im_shape[2].toString() + ".")
        }
		// copy the array into the image variable using JSON for multidimensional array copying
        this.image = JSON.parse(JSON.stringify(arr));
		// update image sizes
        this.nx = this.shape()[1];
        this.ny = this.shape()[0];
    }
    
    // returns a copy of the image
    toArray(){
		// copy the image array using JSON for multidimensional array copying
        return JSON.parse(JSON.stringify(this.image));
    }
    
    // returns the dimensionality of an array
    static ndims(arr){
		// initialize dims to 0
        var dims = 0;
		// check that an array has been given as input parameter
        if(typeof(arr) == 'undefined'){
            throw new Error("Array is not defined");
        }
		// loop through the layers of arr and check if it's still a number
        while(typeof(arr) !== "undefined"){
            dims++;
			// get the next layer
            arr = arr[0];
        }
		// remove one dimension because the last dimension is only a number, not an array
        return dims-1;
    }
    
    // returns the dimensionality of the image
    ndims(){
		// apply ndims to the image
        return IPLabImageAccess.ndims(this.image);
    }
    
    // returns the shape of an array
    static shape(arr){
		// initialize the empty shape array
        var s = [];
		// check if an array was given as input parameter
        if(typeof(arr) == 'undefined'){
            throw new Error("Array is not defined");
        }
		// loop through the layers of arr and check if it's still and array
        while(typeof(arr.length) !== "undefined"){
			// add the length of the current layer to the shape array
            s.push(arr.length);
			// get the next layer
            arr = arr[0];
        }
        return s;
    }
    
    // returns the shape of the image
    shape(){
		// apply shape to the image
        return IPLabImageAccess.shape(this.image);
    }

    // Creates a new 1D/2D/3D array and initializes it to init_value
    static MultidimArray(init_value, height, width, depth){
        /*
        Usage: 
        1d_array = MultidimArray(init_value, height);
        2d_array = MultidimArray(init_value, height, width);
        3d_array = MultidimArray(init_value, height, width, depth);
        */
		// initialize the output array with the first dimension
        var output = new Array(height);
		// for every element of the first dimension, add the other dimensions
        for(var i=0; i < output.length; i++){
            if(typeof(width) == 'undefined'){
				// if no more dimensions, initialize the value to init_value
                output[i] = init_value;
            } else {
				// create the second dimension
                output[i] = new Array(width);
				// for every element of the second dimension add the third dimensions
                for(var j=0; j < output[i].length; j++){
                    if(typeof(depth) == 'undefined'){
						// if no more dimensions, initialize the value to init_value
                        output[i][j] = init_value;
                    } else {
						// create the third dimension
                        output[i][j] = new Array(depth);
						// for every element of the third dimension initialize the value to init_value
                        for(var k=0; k < output[i][j].length; k++){
                            output[i][j][k] = init_value;
                        }
                    }
                }
            }
        }
        return output;
    }

    // returns the neighbourhood of an array
    static getNbh(img, x_pos, y_pos, nx, ny, padding = 'mirror'){
        /*
        Returns a neighbourhood neigh[][] of shape (nx,ny) around the pixel (x_pos, y_pos) in img

        For example if (nx, ny) = (4, 4):
        The pixel value of (x-1, y-1) is put into neigh[0][0]
        The pixel value of (x , y ) is put into neigh[1][1]
        The pixel value of (x, y+1) is put into neigh[1][2]
        The pixel value of (x+1, y-1) is put into neigh[2][0]
        ...
        For example if (nx, ny) = (5, 5)::
        The pixel value of (x-2, y-2) is put into neigh[0][0]
        The pixel value of (x-1, y-1) is put into neigh[1][1]
        The pixel value of (x , y ) is put into neigh[2][2]
        The pixel value of (x, y+1) is put into neigh[2][3]
        The pixel value of (x+2, y-2) is put into neigh[4][0]
        */
		// initialize variables
        var count = 0;
        var shap = IPLabImageAccess.shape(img);
        var rgb = false;
        // check if image has colour channels
        if(IPLabImageAccess.ndims(img) == 3){
            rgb = true;
        }
        var neigh = IPLabImageAccess.MultidimArray(0, ny, nx);
        for(var y = 0; y < ny; y++){  
            for(var x = 0; x < nx; x++){
                // calculate x and y position offset
                var y_offset = y_pos - Math.floor(ny/2) + y;
                var x_offset = x_pos - Math.floor(nx/2) + x;
                // padding
                if(y_offset < 0){
					// apply zero padding
                    if(padding == 'zero'){
                        neigh[y][x] = (rgb ? [0, 0, 0] : 0);
                        continue;
                    }else if(padding == 'repeat'){
                        // apply repeated folding
                        y_offset = shap[0] - (Math.abs(y_offset) % shap[0]);
                    }else{
                        // apply mirror folding
                        y_offset = -y_offset - 1;
                    }
                }if(y_offset >= shap[0]){
					// apply zero padding
                    if(padding == 'zero'){
                        neigh[y][x] = (rgb ? [0, 0, 0] : 0);
                        continue;
                    }else if(padding == 'repeat'){
                        // apply repeated folding
                        y_offset = y_offset % shap[0];
                    }else{
                        // apply mirror folding
                        y_offset = shap[0] - 1 - (y_offset % shap[0]);
                    }
                }
                if(x_offset < 0){
                    if(padding == 'zero'){
						// apply zero padding
                        neigh[y][x] = (rgb ? [0, 0, 0] : 0);
                        continue;
                    }else if(padding == 'repeat'){
                        // apply repeated folding
                        x_offset = shap[1] - (Math.abs(x_offset) % shap[1]);
                    }else{
                        // apply mirror folding
                        x_offset = -x_offset - 1;
                    }
                }if(x_offset >= shap[1]){
                    if(padding == 'zero'){
						// apply zero padding
                        neigh[y][x] = (rgb ? [0, 0, 0] : 0);
                        continue;
                    }else if(padding == 'repeat'){
                        // apply repeated folding
                        x_offset = x_offset % shap[1];
                    }else{
                        // apply mirror folding
                        x_offset = shap[1] - 1 - (x_offset % shap[1]);
                    }
                }
				// assign pixel to the neighbourhood
                neigh[y][x] = img[y_offset][x_offset];
            }
        }
        return neigh;
    }
    
    // returns the neighbourhood of the image
    getNbh(x_pos, y_pos, nx, ny, padding = 'mirror'){
		// get the neighbourhood of the image
        var nbh = new IPLabImageAccess(IPLabImageAccess.getNbh(this.image, x_pos, y_pos, nx, ny, padding=padding));
        return nbh;
    }
    
    // calculates the minimum per color channel of two color- or graylevel pixels
    static min(a, b){
        var rgb = false;
        // check if gray or colour pixel
        if(typeof(a.length) == 'undefined' && typeof(b.length) == 'undefined'){
            rgb = false;
        }else if(typeof(a.length) == 'undefined' && b.length == 3){
            rgb = true;
            a = [a, a, a];
        }else if(a.length == 3 && typeof(b.length) == 'undefined'){
            rgb = true;
            b = [b, b, b];
        }else if (a.length == 3 && b.length == 3){
            rgb = true;
        }else{
            throw new Error("Input pixels are neither graylevel nor rgb");
        }
        // calculate min
        if(rgb == true){
			// calculate the minimum for each channel
            return [Math.min(a[0], b[0]), Math.min(a[1], b[1],), Math.min(a[2], b[2],)];
        }else{
			// calculate the minimum
            return Math.min(a,b);
        }
    }

    // returns the maximum value of an array with arbitrary dimensions
    static getMax(arr){
		// check that an array has been given at input
        if(typeof(arr) == 'undefined'){
            throw new Error("Array is undefined");
        }
		// calculate the maximum of all elements of the image
        return Math.max(...arr.map(e => Array.isArray(e) ? IPLabImageAccess.getMax(e) : e));
    }
    
    // returns the minimum value of an array with arbitrary dimensions
    static getMin(arr){
		// check that an array has been given at input
        if(typeof(arr) == 'undefined'){
            throw new Error("Array is undefined");
        }
		// calculate the minimum of all elements of the image
        return Math.min(...arr.map(e => Array.isArray(e) ? IPLabImageAccess.getMin(e) : e));
    }
    
    
    // returns the maximum value of the image
    getMax(){
		// apply getMax to the image
        return IPLabImageAccess.getMax(this.image);
    }
    
    // returns the minimum value of the image
    getMin(){
		// apply getMin to the image
        return IPLabImageAccess.getMin(this.image);
    }
    
	// normalize the image statics
    normalize(){
		// initialize parameters
        var output = new IPLabImageAccess(this.shape())
        var min = this.getMin()
        var range = this.getMax() - min
		// loop through all pixels
        for(var x = 0; y < this.nx; y++){
            for(var y = 0; y < this.ny; y++){
                var val = this.getPixel(x, y)
				// normalize pixel (range = [0,1])
                val = (val - min)/range
				// set the output pixel
                output.setPixel(x, y, val)
            }
        }
        return output
    }
    // returns the pixel at position (x,y)
    getPixel(x, y, padding='mirror'){
        // store original coordinate for message display
        var x_orig = x;
        var y_orig = y;
        // variable to check if an out of bounds pixel has been accessed
        var out_of_bounds = false;
        var rgb = false;
        // check if image has colour channels
        if(IPLabImageAccess.ndims(this.image) == 3){
            rgb = true;
        }
        // padding
        if(y < 0){
            out_of_bounds = true;
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                y = this.ny - (Math.abs(y) % this.ny);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = -y;
            }
        }if(y >= this.ny){
            out_of_bounds = true;
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                y = y % this.ny;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = this.ny - 1 - (y % this.ny);
            }
        }
        if(x < 0){
            out_of_bounds = true;
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                x = this.nx - (Math.abs(x) % this.nx);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = -x;
            }
        }if(x >= this.nx){
            out_of_bounds = true;
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                x = x % this.nx;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = this.nx - 1 - (x % this.nx);
            }
        }
        if(out_of_bounds){
            // provide a warning if an out-of-bounds pixel was accessed in case this was not intentional
            //console.warn("Pixel (" + x_orig.toString() + "," + y_orig.toString() + ") is out of bounds: " + padding + "-padding was applied.");
            if(padding == 'zero'){
                return rgb ? [0, 0, 0] : 0;
            }
        }
        return this.image[y][x];
    }
    
    // sets the pixel value at location (x,y)
    setPixel(x, y, value, padding='mirror'){
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 2 && typeof(value.length) != 'undefined'){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing an rgb value to a grayscale image converts this pixel to rgb.")
        }
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 3 && value.length != 3){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing grayscale value to an rgb image converts this pixel to grayscale.")
        }
        // store original coordinate for message display
        var x_orig = x;
        var y_orig = y;
        // shape of the image
        var shap = this.shape();
        // variable to check if an out of bounds pixel has been accessed
        var out_of_bounds = false;
        var rgb = false;
        // check if image has colour channels
        if(this.ndims() == 3){
            rgb = true;
        }
        // padding
        if(y < 0){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                y = this.ny - (Math.abs(y) % this.ny);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = -y;
            }
        }if(y >= this.ny){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                y = y % this.ny;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = this.ny - 1 - (y % this.ny);
            }
        }
        if(x < 0){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                x = this.nx - (Math.abs(x) % this.nx);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = -x;
            }
        }if(x >= this.nx){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                x = x % this.nx;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = this.nx - 1 - (x % this.nx);
            }
        }
        if(out_of_bounds){
            // provide a warning if an out-of-bounds pixel was accessed in case this was not intentional
            //console.warn("Pixel (" + x_orig.toString() + "," + y_orig.toString() + ") is out of bounds: " + padding + "-padding was applied.");
        }
        this.image[y][x] = value;
    }
    
    
    getRow(y, padding = 'mirror'){
		// initialize parameters
        var y_orig = y;
        var out_of_bounds = false
        var rgb = false;     
        if(IPLabImageAccess.ndims(this.image) == 3){
            rgb = true;
        }
        // padding
        if(y < 0) {
            out_of_bounds = true
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                y = this.ny - (Math.abs(y) % this.ny);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = -y;
            }
        }if(y >= this.ny){
            out_of_bounds = true;
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                y = y % this.ny;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = this.ny - 1 - (y % this.ny);
            }
        }
        if(out_of_bounds){
            if(padding == 'zero'){     
				// if zero padding should be applied, return a row of zeros
                return rgb ? [Array(this.nx).fill(0), Array(this.nx).fill(0), Array(this.nx).fill(0)] : new Array(this.nx).fill(0);
            }
        }
        return this.image[y];
    }
    
    getColumn(x, padding = 'mirror'){
		// initialize parameters
        var out_of_bounds = false
        var rgb = false;     
        if(IPLabImageAccess.ndims(this.image) == 3){
            rgb = true;
        }
        // padding
        if(x < 0) {
            out_of_bounds = true
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                x = this.nx - (Math.abs(x) % this.nx);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = -x;
            }
        }if(x >= this.nx){
            out_of_bounds = true;
            if(padding == 'zero'){
            }else if(padding == 'repeat'){
                // apply repeated folding
                x = x % this.nx;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = this.nx - 1 - (x % this.nx);
            }
        }
        if(out_of_bounds){
            if(padding == 'zero'){
				// if zero padding should be applied, return a column of zeros
                return rgb ? [Array(this.ny).fill(0), Array(this.ny).fill(0), Array(this.ny).fill(0)] : new Array(this.ny).fill(0);
            }
        }
		// use transposed image to extract a column
        var image = IPLabImageAccess.transpose(this.image);
        return image[x]
    }
    
    putRow(y, new_row){
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 2 && typeof(y.length) == 3 || typeof(y.length) != 'undefined'){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing an rgb value to a grayscale image converts this pixel to rgb.")
        }
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 3 && value.length != 3){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing grayscale value to an rgb image converts this pixel to grayscale.")
        }
        // variable to check if an out of bounds pixel has been accessed
        var out_of_bounds = false;
        var rgb = false;
        // check if image has colour channels
        if(this.ndims() == 3){
            rgb = true;
        }
        // padding
        if(y < 0){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                y = this.ny - (Math.abs(y) % this.ny);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = -y;
            }
        }if(y >= this.ny){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                y = y % this.ny;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                y = this.ny - 1 - (y % this.ny);
            }
        }
        this.image[y] = new_row;
    }
    
    
    putColumn(x, new_column){
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 2 && typeof(x.length) == 3 || typeof(x.length) != 'undefined'){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing an rgb value to a grayscale image converts this pixel to rgb.")
        }
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 3 && value.length != 3){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing grayscale value to an rgb image converts this pixel to grayscale.")
        }
        // store original coordinate for message display
        var out_of_bounds = false;
        var rgb = false;
        // check if image has colour channels
        if(this.ndims() == 3){
            rgb = true;
        }
        // padding
        if(x < 0){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                x = this.nx - (Math.abs(x) % this.nx);
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = -x;
            }
        }if(x >= this.nx){
            out_of_bounds = true;
            if(padding == 'repeat'){
                // apply repeated folding
                x = x % this.nx;
            }else{
                // defaults to mirror-padding
                padding = 'mirror';
                // apply mirror folding
                x = this.nx - 1 - (x % this.ny);
            }
        }
		// use transpose of image to put a new column
        var image = IPLabImageAccess.transpose(this.image);
        image[x] = new_column;
		// re-transpose to get original image
        image = IPLabImageAccess.transpose(image);
        this.image = image;
    }
    
	// returns the transpose of an array
    static transpose(array){
		// map the rows to the columns
        return array[0].map((x,i) => array.map(x => x[i]))
    }
    
	// returns the transpose of the image
    transposeImage() {
		// apply transpose to the image
        this.image = IPLabImageAccess.transpose(this.image) 
    }
    
	// compares two arrays
    static arrayCompare(a1, a2, tol=1e-5){
		// check if the array have the same size
		if(a1.length != a2.length) {
			return false;
		}
		for(var i in a1) {
		 // Don't forget to check for arrays in our arrays.
			if(a1[i] instanceof Array && a2[i] instanceof Array) {
				if(!IPLabImageAccess.arrayCompare(a1[i], a2[i])) {
					return false;
				}
			}
			// check if the difference between the arrays is greater than the tolerance
			else if(Math.abs(a1[i] - a2[i]) > tol) {
				return false;
			}
		}
		return true;
	}
	
    // compares the image with another image
    imageCompare(newImage, tol=1e-5){
		// apply arrayCompare to the two images
        return IPLabImageAccess.arrayCompare(newImage.image, this.image, tol);
    }
    
	// returns the elements of the image that are under the structuring element b in ascending order
	// if b is not specified, all all values are sorted
    sort(b){
        // if no structuring element given, use all pixels
        if(typeof(b) == 'undefined'){
            b = new IPLabImageAccess(IPLabImageAccess.MultidimArray(true, this.ny, this.nx));
        }
		// check if gray or color image is used
        if(IPLabImageAccess.ndims(this.image) == 2){
            var gray = new Array();
			// loop through every pixel
            for(var x=0; x < this.nx; x++){
                for(var y=0; y < this.ny; y++){
					// check if the pixel is under the structuring element
                    if(b.getPixel(x, y) == true || b.getPixel(x, y) == 1){
						// if yes, add the pixel to the output array
                        gray.push(this.image[y][x]);
                    }
                }
            }
			// sort the output array in ascending order
            gray.sort((a,b) => a-b);
			// return the sorted array
            return gray;
        }else{
            var r_ = new Array();
            var g_ = new Array();
            var b_ = new Array();
			// loop through every pixel
            for(var x=0; x < this.nx; x++){
                for(var y=0; y < this.ny; y++){
					// check if the pixel is under the structuring element
                    if(b.getPixel(x, y) == true || b.getPixel(x, y) == 1){
						// if yes, add the pixel to the output array
                        r_.push(this.image[y][x][0]);
                        g_.push(this.image[y][x][1]);
                        b_.push(this.image[y][x][2]);
                    }
                }
            }
			// sort the output array in ascending order
            r_.sort((a,b) => a-b);
            g_.sort((a,b) => a-b);
            b_.sort((a,b) => a-b);
			// return the sorted array
            return [r_, g_, b_];
        }
    }
    
	// create a copy of the image
    copy(){
        return new IPLabImageAccess(this.image);
    }
    
	// put a sub-image into the image
    putSubImage(x, y, img){
		// check if the sub-image location is inside the image
        if(x < 0 || y < 0 || x+img.nx > this.nx || x+img.ny > this.ny){
           throw new Error("Subimgae out of bounds");
        }
        // loop through every pixel of the sub-image
        for(var k = x; k < x+img.nx; k++){
            for(var l = y; l < y+img.ny; l++){
				// put the pixel of the subimage into the image
                var value = img.getPixel(k-x, l-y)
                this.setPixel(k, l, value)
            }
        }                
    }
}


// export the class to use it in other files
module.exports = IPLabImageAccess


/* Notes and bugs
The code is currently bug-free, unlike my appartment...
*/ 
