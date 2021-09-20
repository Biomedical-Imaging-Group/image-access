/**
 * @property {Array} image - The image stored as a 2D Array
 */
class ImageAccess{
	// define private fields
	#min;
	#max;
	#change_check;
	/**
	 * Creates a new image of the specified height and width.
	 * @param {(Integer|Array)} height - The height of the image, or an array of [height, width], or an existing 2D array
	 * @param {Integer} [width] - The width of the image
	 * @param {Object} [init_dict] - Object specifying the initial values for the image
	 * @param {Number} [init_dict.init_value=0] - The initial value to set to all pixels
	 * @param {Boolean} [init_dict.rgb=false] - Boolean indicating if the image is rgb or not
	 * @example <caption>Create a new image of dimensions width x height</caption>
	 * new ImageAccess(height, width);
	 * @example <caption>Provide height and width as an array</caption>
	 * new ImageAccess([height, width]);
	 * @example <caption>Create a new image with the same dimensions as an existing image <code>img</code></caption>
	 * new ImageAccess(img.shape());
	 * @example <caption>Set the initial value to 255</caption>
	 * new Image(height, width, {init_value:255});
	 * @example <caption>Creating an image from an existing 2D Array <code>arr</code></caption>
	 * new Image(arr);
	 * @returns {ImageAccess}
	 */
    constructor(height, width = {}, {rgb=false, init_value=0} = {}){
		// check usage
		if(typeof(height) == 'undefined'){
			// if called without arguments, return without initializing the image
			return;
		// check if height an width are given separately
		}else if(ImageAccess.ndims(height) == 0){
			if(height != parseInt(height) || width != parseInt(width)){
				throw new Error('Non-integer size provided in ImageAccess constructor');
			}
			if(!rgb){
				// if rgb is false, initialize graylevel image
				this.image = ImageAccess.MultidimArray(init_value, height, width);
			}else{
				// if rgb is true, initialize color image
				this.image = ImageAccess.MultidimArray(init_value, height, width, 3);
			}
		// check if height an width are given as an array
		}else if(ImageAccess.ndims(height) == 1 && (height.length == 2 || height.length == 3)){
			// in this case, the optional parameters are stored in width
			rgb = width.rgb || false;
			init_value = width.init_value || 0;
			// height and width given as a an array
			if(height[0] != parseInt(height[0]) || height[1] != parseInt(height[1])){
				throw new Error('Non-integer size provided in ImageAccess constructor');
			}
			if(rgb || (height.length == 3 && height[2] == 3)){
				this.image = ImageAccess.MultidimArray(init_value, height[0], height[1], 3);
			}else{
				this.image = ImageAccess.MultidimArray(init_value, height[0], height[1]);
			}
		// check if the image is given as an array
		}else if(ImageAccess.ndims(height) == 2 || ImageAccess.ndims(height) == 3){
			// initialize from array
			this.fromArray(height);
		}else{
			throw new Error("Unrecognized input data in ImageAccess constructor");
		}
		// assign image sizes
		this.nx = ImageAccess.shape(this.image)[1];
		this.ny = ImageAccess.shape(this.image)[0];
		// initialize min and max
		this.#min = this.getMin(true);
		this.#max = this.getMax(true);
		this.#change_check = false;
    }
    
	/**
	 * Updates the image from a provided array.
	 * @param {Array} arr - A 2D Array containing the image
	 */
    fromArray(arr){
		// get image shape and nb of dimensions
        var im_shape = ImageAccess.shape(arr)
        var im_dims = ImageAccess.ndims(arr)
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
        this.nx = ImageAccess.shape(this.image)[1];
        this.ny = ImageAccess.shape(this.image)[0];
		// recalculate min and max
		this.#min = this.getMin(true);
		this.#max = this.getMax(true);
    }
    
	/**
	 * 
	 * @returns {Array} A Copy of the image as a 2D Array
	 */
    toArray(){
		// copy the image array using JSON for multidimensional array copying
        return JSON.parse(JSON.stringify(this.image));
    }
    
	/**
	 * 
	 * @param {Array} arr 
	 * @returns {Number} The number of dimensions of an array
	 */
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
    
    /**
	 * 
	 * @returns {Number} The number of dimensions of the image
	 */
    ndims(){
		// apply ndims to the image
        return ImageAccess.ndims(this.image);
    }
    
	/**
	 * 
	 * @param {Array} arr 
	 * @returns The shape / size of an array
	 */
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
    
	/**
	 * 
	 * @returns The shape / size of the image
	 */
    shape(){
		// apply shape to the image
        return [this.ny, this.nx];
    }

	/**
	 * Creates a 1D/2D/3D Array
	 * @param {Number} init_value - The initial value to set to all elements of the array
	 * @param {Integer} height - The height of the array
	 * @param {Integer} [width] - The width of the array
	 * @param {Integer} [depth] - The depth of the array
	 * @returns {Array} An array of size <code>height</code> x <code>width</code> x <code>depth</code> initialized to <code>init_value</code>
	 */
    static MultidimArray(init_value, height, width, depth){
		if(height == 'undefined' || init_value == 'undefined'){
			throw new Error('MultidimArray: Provide at least an initial value and a height.');
		}
		if(height != parseInt(height)){
			throw new Error('Non-integer size provided in MultidimArray');
		}
		if(typeof(width) != 'undefined' && width != parseInt(width)){
			throw new Error('Non-integer size provided in MultidimArray');
		}
		if(typeof(depth) != 'undefined' && depth != parseInt(depth)){
			throw new Error('Non-integer size provided in MultidimArray');
		}
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

	/**
	 * Returns a neighbourhood of an Array
	 * @param {Array} img - The 2D input Array
	 * @param {Integer} x_pos - The x position of the center of the neighbourhood
	 * @param {Integer} y_pos - The y position of the center of the neighbourhood
	 * @param {Integer} nx - The width of the neighbourhood
	 * @param {Integer} ny - The height of the neighbourhood
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero')
	 * @returns {Array} - The neighbourhood as a 2D Array
	 */
    static getNbh(img, x_pos, y_pos, nx, ny, padding = 'mirror'){
		if(x_pos != parseInt(x_pos) || y_pos != parseInt(y_pos)){
			throw new Error('Non-integer index provided in getNbh');
		}
		if(nx != parseInt(nx) || ny != parseInt(ny)){
			throw new Error('Non-integer size provided in getNbh');
		}
		// initialize variables
        var count = 0;
        var shap = ImageAccess.shape(img);
        var rgb = false;
        // check if image has colour channels
        if(ImageAccess.ndims(img) == 3){
            rgb = true;
        }
        var neigh = ImageAccess.MultidimArray(0, ny, nx);
        for(var y = 0; y < ny; y++){  
            for(var x = 0; x < nx; x++){
                // calculate x and y position offset
                var y_offset = y_pos - Math.floor(ny/2) + y;
                var x_offset = x_pos - Math.floor(nx/2) + x;
				// apply boundary condition to indexes
                [x_offset, y_offset] = ImageAccess.applyBoundaryCondition(x_offset, y_offset, shap=shap, padding=padding)
				// assign pixel to the neighbourhood
				if(x_offset == -1 || y_offset == -1){
					// zero padding 
					neigh[y][x] = rgb ? [0, 0, 0] : 0;
				}else{
					// other padding
					neigh[y][x] = img[y_offset][x_offset];
				}
                
            }
        }
        return neigh;
    }
    
	/**
	 * Returns a neighbourhood of the image
	 * @param {Integer} x_pos - The x position of the center of the neighbourhood
	 * @param {Integer} y_pos - The y position of the center of the neighbourhood
	 * @param {Integer} nx - The width of the neighbourhood
	 * @param {Integer} ny - The height of the neighbourhood
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero').
	 * @returns {Nbh_Access} - The neighbourhood
	 */
    getNbh(x_pos, y_pos, nx, ny, padding = 'mirror'){
		if(x_pos != parseInt(x_pos) || y_pos != parseInt(y_pos)){
			throw new Error('Non-integer index provided in getNbh');
		}
		if(nx != parseInt(nx) || ny != parseInt(ny)){
			throw new Error('Non-integer size provided in getNbh');
		}
		return new Nbh_Access(this, x_pos, y_pos, nx, ny, padding)
    }
    
	/**
	 * Calculates the minimum per color channel of two color- or graylevel pixels
	 * @param {(Number|Array)} a - The first pixel
	 * @param {(Number|Array)} b - The second pixel
	 * @returns {(Number|Array)} - The minimum per color channel of the two pixels
	 */
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

	/**
	 * Calculates the maximum value of an array with arbitrary dimensions
	 * @param {Array} arr - The input Array
	 * @returns {Number} The maximum
	 */
    static getMax(arr){
		// check that an array has been given at input
        if(typeof(arr) == 'undefined'){
            throw new Error("Array is undefined");
        }
		// calculate the maximum of all elements of the image
        return Math.max(...arr.map(e => Array.isArray(e) ? ImageAccess.getMax(e) : e));
    }
    
	/**
	 * Calculates the minimum value of an array with arbitrary dimensions
	 * @param {Array} arr - The input Array
	 * @returns {Number} The minimum
	 */
    static getMin(arr){
		// check that an array has been given at input
        if(typeof(arr) == 'undefined'){
            throw new Error("Array is undefined");
        }
		// calculate the minimum of all elements of the image
        return Math.min(...arr.map(e => Array.isArray(e) ? ImageAccess.getMin(e) : e));
    }
    
    
    /**
	 * Returns the maximum value of the image
	 * @param {Boolean} [recalc] - A boolean indicating if the maximum needs to be recalculated
	 * @returns {Number} - The maximum value of the image
	 */
    getMax(recalc=false){
		if(recalc==true){
			// apply getMax to the image
			this.#max = ImageAccess.getMax(this.image);
		}else if(this.#change_check==true || typeof(this.#max) == 'undefined'){
			// apply getMax to the image
			this.#max = ImageAccess.getMax(this.image);
			// also rerun getMin
			this.#min = ImageAccess.getMin(this.image);
			// reset change_check
			this.#change_check = false;
		}
		return this.#max;
    }
    
    /**
	 * Returns the minimum value of the image
	 * @param {Boolean} [recalc] - A boolean indicating if the minimum needs to be recalculated
	 * @returns {Number} - The minimum value of the image
	 */
    getMin(recalc=false){
		if(recalc==true){
			// apply getMin to the image
			this.#min = ImageAccess.getMin(this.image);
		}else if(this.#change_check==true || typeof(this.#max) == 'undefined'){
			// also rerun getMax
			this.#max = ImageAccess.getMax(this.image);
			// apply getMin to the image
			this.#min = ImageAccess.getMin(this.image);
			// reset change_check
			this.#change_check = false;
		}
		return this.#min;
		
    }
    
	/**
	 * Maps the image to the range [0,1]
	 * @returns {ImageAccess} The remapped image
	 */
    normalize(){
		// initialize parameters
        var output = new ImageAccess([this.ny, this.nx])
        var min = this.getMin()
        var range = this.getMax() - min
		// loop through all pixels
        for(var x = 0; x < this.nx; x++){
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

	/**
	 * Returns the pixel value at position (x,y)
	 * @param {Integer} x - The horizontal (x) position of the pixel
	 * @param {Integer} y - The vertical (y) position of the pixel
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero') 
	 * @returns {Number} The pixel value
	 */
    getPixel(x, y, padding='mirror'){
		if(x != parseInt(x) || y != parseInt(y)){
			throw new Error('Non-integer index provided in getPixel');
		}
        // apply boundary conditions
		[x, y] = ImageAccess.applyBoundaryCondition(x, y, [this.ny, this.nx], padding=padding);
        if(x == -1 || y == -1){
			// zero padding
			return ImageAccess.ndims(this.image) == 3 ? [0, 0, 0] : 0;
		}else{
			// other padding
			return this.image[y][x];
		}
    }
    
	/**
	 * Sets the pixel value at location (x,y)
	 * @param {Integer} x - The horizontal (x) position of the pixel
	 * @param {Integer} y - The vertical (y) position of the pixel
	 * @param {Number} value - The new value to which this pixel will be set
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero')
	 */
    setPixel(x, y, value, padding='mirror'){
		if(x != parseInt(x) || y != parseInt(y)){
			throw new Error('Non-integer index provided in setPixel');
		}
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
		// check for paddings
		if(padding != 'mirror' && padding != 'repeat'){
			throw new Error('setPixel does not support ' + padding + '-padding! Use mirror or repeat.');
		}
        // store original coordinate for message display
        var x_orig = x;
        var y_orig = y;
        // shape of the image
        var shap = [this.ny, this.nx];
        // variable to check if an out of bounds pixel has been accessed
        var out_of_bounds = false;
        var rgb = false;
        // check if image has colour channels
        if(this.ndims() == 3){
            rgb = true;
        }
        // apply boundary conditions
        [x,y] = ImageAccess.applyBoundaryCondition(x, y, shap, padding=padding)
        this.image[y][x] = value;
		// reset change_check
		this.#change_check = true;
    }
    
    /**
	 * Returns the row of pixels at location y
	 * @param {Integer} y - The vertical (y) location of the row
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero') 
	 * @returns {ImageAccess} The row of pixels at location y
	 */
    getRow(y, padding = 'mirror'){
		if(y != parseInt(y)){
			throw new Error('Non-integer index provided in getRow');
		}
		// initialize parameters
        var y_orig = y;
        var out_of_bounds = false
        var rgb = false;     
        if(ImageAccess.ndims(this.image) == 3){
            rgb = true;
        }
        // padding
        y = ImageAccess.applyBoundaryCondition(0, y, [this.ny, this.nx], padding=padding)[1]
        if(y == -1){
			// if zero padding should be applied, return a row of zeros
			return rgb ? new ImageAccess([new Array(this.nx).fill([0, 0, 0])]) : new ImageAccess([new Array(this.nx).fill(0)]);
        }else{
			return new ImageAccess([this.image[y]]);
		}
    }
    
	/**
	 * Returns the column at location x
	 * @param {Integer} x - The horizontal (x) location of the column
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero')
	 * @returns {ImageAccess} The column of pixels at location x
	 */
    getColumn(x, padding = 'mirror'){
		if(x != parseInt(x)){
			throw new Error('Non-integer index provided in getColumn');
		}
		// initialize parameters
        var out_of_bounds = false
        var rgb = false;     
        if(ImageAccess.ndims(this.image) == 3){
            rgb = true;
        }
        // padding
        x = ImageAccess.applyBoundaryCondition(x, 0, [this.ny, this.nx], padding=padding)[0]
        if(x == -1){
			// if zero padding should be applied, return a column of zeros
			return rgb ? new ImageAccess([new Array(this.nx).fill([0, 0, 0])]) : new ImageAccess([new Array(this.nx).fill(0)]);
        }else{
			// extract column
			return new ImageAccess([this.image.map(function(element) {return element[x];})]);
		}
    }
    
	/**
	 * Inserts a row at location y
	 * @param {Integer} y - The vertical (y) position of the row
	 * @param {ImageAccess} new_row - The new row to insert
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero') 
	 */
    putRow(y, new_row, padding='mirror'){
		var is_row = true;
		// check that y is integer
		if(y != parseInt(y)){
			throw new Error('Non-integer index provided in putRow');
		}
		// check that a 1D image object has been provided
		if(new_row.nx != 1 && new_row.ny != 1){
			throw new Error('putRow: Provide a 1D image object that contains either a single row or a single column for new_row.')
		}
		// check if a column has been provided
		if(new_row.nx == 1){
			is_row = false;
		}
		// check if the row has the correct length
		if(is_row == true && new_row.nx != this.nx){
			throw new Error('putRow: The provided row has length ' + new_row.nx + ' but the image has width ' + this.nx);
		}else if(is_row == false && new_row.ny != this.nx){
			throw new Error('putRow: The provided row has length ' + new_row.ny + ' but the image has width ' + this.nx);
		}
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 2 && ImageAccess.ndims(new_row) == 2 && ImageAccess.shape(new_row)[1] == 3){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing an rgb value to a grayscale image converts this pixel to rgb.")
        }
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 3 && ImageAccess.ndims(new_row) == 2){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing grayscale value to an rgb image converts this pixel to grayscale.")
        }
		// check for paddings
		if(padding != 'mirror' && padding != 'repeat'){
			throw new Error('putRow does not support ' + padding + '-padding! Use mirror or repeat.');
		}
        // variable to check if an out of bounds pixel has been accessed
        var out_of_bounds = false;
        var rgb = false;
        // check if image has colour channels
        if(this.ndims() == 3){
            rgb = true;
        }
        // padding
        y = ImageAccess.applyBoundaryCondition(0, y, [this.ny, this.nx], padding=padding)[1];
		// insert new row
		if(is_row == true){
			this.image[y] = new_row.image[0];
		}else{
			for(var x=0; x < this.nx; x++){
				this.image[y][x] = new_row.image[x][0];
			}
		}
        // reset change_check
		this.#change_check = true;
    }
    
    /**
	 * Inserts a new column at location x
	 * @param {Integer} x - The horizontal (x) location of the column
	 * @param {ImageAccess} new_column - The new column to insert
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero') 
	 */
    putColumn(x, new_column, padding='mirror'){
		var is_row = true;
		// check that x is integer
		if(x != parseInt(x)){
			throw new Error('Non-integer index provided in putColumn');
		}
		// check that a 1D image object has been provided
		if(new_column.nx != 1 && new_column.ny != 1){
			throw new Error('putColumn: Provide a 1D image object that contains either a single row or a single column for new_column.')
		}
		// check if a column has been provided
		if(new_column.nx == 1){
			is_row = false;
		}
        // check if the column has the correct length
		if(is_row == true && new_column.nx != this.ny){
			throw new Error('putColumn: The provided column has length ' + new_column.nx + ' but the image has height ' + this.ny);
		}else if(is_row == false && new_column.ny != this.ny){
			throw new Error('putColumn: The provided column has length ' + new_column.ny + ' but the image has height ' + this.ny);
		}
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 2 && ImageAccess.ndims(new_column) == 2 && ImageAccess.shape(new_column)[1] == 3){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing an rgb value to a grayscale image converts this pixel to rgb.")
        }
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 3 && ImageAccess.ndims(new_column) == 1){
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
        x = ImageAccess.applyBoundaryCondition(x, 0, [this.ny, this.nx], padding=padding)[0];
		
		// put new column
		if(is_row == true){
			for(var y=0; y < this.ny; y++){
				this.image[y][x] = new_column.image[0][y];
			}
		}else{
			for(var y=0; y < this.ny; y++){
				this.image[y][x] = new_column.image[y][0];
			}
		}
		// reset change_check
		this.#change_check = true;
    }
    
	/**
	 * Returns the transpose of an array
	 * @param {Array} array - The 2D input Array
	 * @returns {Array} The transposed Array
	 */
    static transpose(array){
		// map the rows to the columns
        return array[0].map((x,i) => array.map(x => x[i]))
    }
    
	/**
	 * Transposes the image in-place
	 */
    transposeImage(){
		// apply transpose to the image
        this.image = ImageAccess.transpose(this.image) 
		var old_nx = this.nx;
		this.nx = this.ny;
		this.ny = old_nx;
    }
	
	// function that checks if there is a normalization error between the arrays img1 and img2
	/**
	 * Checks if there is a normalization error between two Arrays. A normalization error means that one array is a scalar multiple of the other.
	 * @param {Array} img1 - The first array
	 * @param {Array} img2 - The second array
	 * @param {Object} [c]
	 * @param {Number} [c.c=null] - The proportionality constant to check for. If not given it is calculated from the first pixel
	 * @param {Number} [tol=1e-3] - The tolerance used for the comparison
	 * @returns {Boolean} <code>true</code> if it is a normalization error, <code>false</code> if not
	 */
	static isNormalizationError(img1, img2, c={'c':null}, tol=1e-3){
		// check if the array have the same size
		if(img1.length != img2.length){
			return false;
		}
		for(var i in img1){
		    // Don't forget to check for arrays in our arrays.
			if(img1[i] instanceof Array && img2[i] instanceof Array) {
				if(!ImageAccess.isNormalizationError(img1[i], img2[i], c)){
					return false;
				}
			}
			else{
				// Initialize proportionality constant
				if(c.c == null && img1[i] != 0 && img2[i] != 0){
					   c.c = img1[i] / img2[i];
				}
				// If only one is 0, not proportional
				if((img1[i] == 0) ^ (img2[i] == 0)){
					return false;
				}
				// Check proportionality constant, if both are not 0
				if(img2[i] != 0){
					if (Math.abs(img1[i]/img2[i] - c.c) > tol){
						return false;
					}
				}
			}
		}
		return true;
	}
	
	/**
	 * Checks if there is a normalization error between this image and another image. A normalization error means that one array is a scalar multiple of the other.
	 * @param {ImageAccess} img - The other image to compare
	 * @returns {Boolean} <code>true</code> if it is a normalization error, <code>false</code> if not
	 */
	isNormalizationError(img){
		return ImageAccess.isNormalizationError(this.image, img.image);
	}
    
	/**
	 * Checks if two array are equal within a certain tolerance
	 * @param {Array} a1 - The first array
	 * @param {Array} a2 - The second array
	 * @param {Object} [err] - Object containing the error message
	 * @param {Boolean} [err.msg=null] - The error message, specifying the type of error and more info
	 * @param {Number} [tol=1e-5] - The tolerance used for the comparison
	 * @param {Object} [utilObj] - Object containing internally used variables
	 * @param {Number} [utilObj.mismatch=0] - The mismatch ratio
	 * @param {Number} [utilObj.maxErr=0] - The maximum error between the two Arrays
	 * @param {Number} [utilObj.count=0] - The number of mismatched elements
	 * @returns {Boolean} <code>true</code> if the two Arrays are equal within the tolerance, <code>false</code> if not
	 */
    static arrayCompare(a1, a2, err={'msg':null}, tol=1e-5, utilObj={'mismatch':0, 'maxErr':0, 'count':0}){
		// check if only tolerance has been provided
		if(typeof err !== 'object' && err !== null){
			tol = err;
			err = {'msg':null};
		}
		// check if the array have the same size
		if(a1.length != a2.length){
			return false;
		}
		let norm_err = true;
		let check_err = false;
		let single_row = false;
		let c = {'c':null}
		for(let i in a1){
		    // Don't forget to check for arrays in our arrays.
			if(a1[i] instanceof Array && a2[i] instanceof Array){
				if(!ImageAccess.arrayCompare(a1[i], a2[i], err, tol, utilObj)){
					check_err = true;
					if(!ImageAccess.isNormalizationError(a1[i], a2[i], c)){
						norm_err = false;
					}
				}
			}
			// check if the difference between the arrays is greater than the tolerance
			else{
				utilObj.count++;
				if(Math.abs(a1[i] - a2[i]) > tol || isNaN(a1[i]) || isNaN(a2[i])){
					utilObj.mismatch++;
					if(Math.abs(a1[i] - a2[i]) > Math.abs(utilObj.maxErr)){
						utilObj.maxErr = a1[i] - a2[i];
					}
					check_err = true;
					single_row = true;
				}
			}
		}
		if(check_err){
			if(single_row){
				return false;
			}
			err.msg = 'Number of mismatched elements: ' + utilObj.mismatch + ' (' + Math.round(utilObj.mismatch/utilObj.count*100) + '%)' +
						'\nMax error: ' + utilObj.maxErr;
			if(norm_err){
				err.msg += '\nNormalization error: The image should be normalized by a factor of ' + c.c;
			}
			return false;
		}
		return true;
	}
	
    // compares the image with another image
	/**
	 * Checks if this image is equal to another within a certain tolerance
	 * @param {ImageAccess} newImage - The second image to compare
	 * @param {Object} [err] - Object containing the error message
	 * @param {Boolean} [err.msg=null] - The error message, specifying the type of error and more info
	 * @param {Number} [tol=1e-5] - The tolerance used for the comparison
	 * @returns {Boolean} <code>true</code> if the two images are equal within the tolerance, <code>false</code> if not
	 */
    imageCompare(newImage, err={'msg':null}, tol=1e-5){
		// apply arrayCompare to the two images
        return ImageAccess.arrayCompare(newImage.image, this.image, err, tol);
    }
    
	/**
	 * Returns the pixel values in ascending order
	 * @param {ImageAccess} [b] - The kernel. It should be the same size as the image and contain 0s and 1s (or any other number), specifying which pixels are used during the sorting. By default, all pixels are used
	 * @returns {ImageAccess} The sorted pixels in ascending order
	 */
    sort(b){
        // if no structuring element given, use all pixels
        if(typeof(b) == 'undefined'){
            b = new ImageAccess(ImageAccess.MultidimArray(true, this.ny, this.nx));
        }
		// check if gray or color image is used
        if(ImageAccess.ndims(this.image) == 2){
            var gray = new Array();
			// loop through every pixel
            for(var x=0; x < this.nx; x++){
                for(var y=0; y < this.ny; y++){
					// check if the pixel is under the structuring element
                    if(b.getPixel(x, y) > 0){
						// if yes, add the pixel to the output array
                        gray.push(this.image[y][x]);
                    }
                }
            }
			// sort the output array in ascending order
            gray.sort((a,b) => a-b);
			// return the sorted array
            return new ImageAccess([gray]);
        }else{
            var r_ = new Array();
            var g_ = new Array();
            var b_ = new Array();
			// loop through every pixel
            for(var x=0; x < this.nx; x++){
                for(var y=0; y < this.ny; y++){
					// check if the pixel is under the structuring element
                    if(b.getPixel(x, y) > 0){
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
            return [new ImageAccess([r_]), new ImageAccess([g_]), new ImageAccess([b_])];
        }
    }
    
	/**
	 * Creates a copy of the image
	 * @returns {ImageAccess} A copy of the image
	 */
    copy(){
        return new ImageAccess(this.image);
    }
    
	/**
	 * Inserts another image into the image
	 * @param {Integer} x - The horizontal (x) location of the top-left corner of the sub-image
	 * @param {Integer} y - The vertical (y) location of the top-left corner of the sub-image
	 * @param {ImageAccess} img - The image to insert
	 */
    putSubImage(x, y, img){
		if(x != parseInt(x) || y != parseInt(y)){
			throw new Error('Non-integer index provided in putSubImage');
		}
		// check if the sub-image location is inside the image
        if(x < 0 || y < 0 || x+img.nx > this.nx || y+img.ny > this.ny){
           throw new Error("Subimage out of bounds");
        }
        // loop through every pixel of the sub-image
        for(var k = x; k < x+img.nx; k++){
            for(var l = y; l < y+img.ny; l++){
				// put the pixel of the subimage into the image
                var value = img.getPixel(k-x, l-y)
                this.setPixel(k, l, value)
            }
        }
		// reset change_check
		this.#change_check = true;		
    }
	
	/**
	 * Returns a sub-image from the image
	 * @param {Integer} x - The horizontal (x) location of the top-left corner of the sub-image
	 * @param {Integer} y - The vertical (y) location of the top-left corner of the sub-image
	 * @param {Integer} nx - The width of the sub-image
	 * @param {Integer} ny - The height of the sub-image
	 * @returns {ImageAccess} - The extracted sub-image
	 */
	getSubImage(x, y, nx, ny){
        if(x != parseInt(x) || y != parseInt(y)){
			throw new Error('Non-integer index provided in putSubImage');
		}
        // check if the sub-image location is inside the image
        if(x < 0 || y < 0 || x+nx > this.nx || y+ny > this.ny){
           throw new Error("Subimage out of bounds");
        }
        var output = new ImageAccess(ny, nx);
        
        for(var k = x; k < x+nx; k++){
            for(var l = y; l < y+ny; l++){
				// put the pixel of the subimage into the image
                var value = this.getPixel(k, l)
                output.setPixel(k - x, l - y, value)
            }
        }
        return output;
    }
	
	// adjusts the index depending on the boundary conditions
	/**
	 * Adjusts index values based on the shape and specified boudary conditions
	 * @param {Integer} x - The x index
	 * @param {Integer} y - The y index
	 * @param {Array} shap - The shape (size) of the image (<code>[ny, nx]</code>)
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero') 
	 * @returns {Array} The modified indices as an array (<code>[x, y]</code>)
	 */
	static applyBoundaryCondition(x, y, shap, padding='mirror'){
		// padding
		if(y < 0){
			// apply zero padding
			if(padding == 'zero'){
				y = -1;
			}else if(padding == 'repeat'){
				// apply repeated folding
				y = shap[0] - (Math.abs(y) % shap[0]);
			}else{
				// apply mirror folding
				y = -y - 1;
			}
		}if(y >= shap[0]){
			// apply zero padding
			if(padding == 'zero'){
				y = -1;
			}else if(padding == 'repeat'){
				// apply repeated folding
				y = y % shap[0];
			}else{
				// apply mirror folding
				y = shap[0] - 1 - (y % shap[0]);
			}
		}
		if(x < 0){
			if(padding == 'zero'){
				// apply zero padding
				x = -1;
			}else if(padding == 'repeat'){
				// apply repeated folding
				x = shap[1] - (Math.abs(x) % shap[1]);
			}else{
				// apply mirror folding
				x = -x - 1;
			}
		}if(x >= shap[1]){
			if(padding == 'zero'){
				// apply zero padding
				x = -1;
			}else if(padding == 'repeat'){
				// apply repeated folding
				x = x % shap[1];
			}else{
				// apply mirror folding
				x = shap[1] - 1 - (x % shap[1]);
			}
		}
		return [x, y];
	}
	
	/**
	 * Returns a formatted string that can be used to display the image in the console
	 * @param {Integer} [decimals=3] - The number of maximal decimals to use
	 * @returns {String} The image as a formatted string
	 */
	visualize(decimals=3){
		if(this.ndims() == 3){
            throw new Error("Visualization of RGB image is not yet implemented.")
        }
		// Determine needed length of strings
		var int_check = true;
		var pre_l = 0;
		var post_l = 0;
		for(var row=0; row < this.ny; row++){
			for(var col=0; col < this.nx; col++){
				if(int_check==true && !Number.isInteger(this.getPixel(col, row))){
					int_check = false;
				}
				var int_val = this.getPixel(col, row).toLocaleString('fullwide', {useGrouping:false, maximumFractionDigits:20}).split('.');
				pre_l = Math.max(pre_l, int_val[0].length);
				if(int_val.length > 1){
					post_l = Math.max(post_l, int_val[1].length);
				}
			}
		}
		decimals = Math.min(decimals, post_l);
		// Construct image string
		var msg = '[[ ';
		for(var row=0; row < this.ny; row++){
			if(row != 0){
				msg += '\n [ ';
			}
			for(var col=0; col < this.nx; col++){
				if(int_check==true){
					msg += this.getPixel(col, row).toString(10).padStart(pre_l, ' ') + ' ';
				}else if(decimals==0){
					msg += this.getPixel(col, row).toFixed(0).toString(10).padStart(pre_l, ' ') + ' ';
				}else{
					msg += this.getPixel(col, row).toFixed(decimals).toString(10).padStart(pre_l+decimals+1, ' ') + ' ';
				}
			}
			msg += ']';
		}
		msg += ']\n';
		return msg;
	}

	/**
	 * Returns an html canvas to display the image
	 * @param {Number} [scale=1] - The size scale of the image
	 * @param {Boolean} [showPixels=false] - Indicates whether a pixel grid is drawn or not (only use for small images)
	 * @param {String} [id=''] - The html canvas id to use
	 * @returns {HTMLCanvasElement} - The html canvas containing the image
	 */
	displayImage(scale=1, showPixels=false, id=''){
		if(scale <= 1){
			showPixels=false;
		}
		// Scale image size
		let nx = parseInt(this.nx * scale);
		let ny = parseInt(this.ny * scale);
		// Create data structure to store the r, g, b, a values
		let data = new Uint8ClampedArray(nx * ny * 4);
		let x_acc = scale;
		for(let x=0; x < nx; x++){
			let y_acc = scale;
			for(let y=0; y < ny; y++){
				let start_idx = (y * nx + x)*4;
				let value = this.getPixel(parseInt(x/scale), parseInt(y/scale))
				// Draw gray lines indicating the pixels
				if(showPixels){
					if(x >= x_acc){
						value = 127;
					}
					if(y >= y_acc){
						value = 127;
						y_acc += scale;
					}
				}
				if(this.ndims == 3){
					// Color pixels
					data[start_idx] = value[0]; // r
					data[start_idx+1] = value[1]; // g
					data[start_idx+2] = value[2]; // b
				}else{
					// Gray pixels
					data[start_idx] = value; // r
					data[start_idx+1] = value; // g
					data[start_idx+2] = value; // b
				}
				// Alpha is always 255
				data[start_idx+3] = 255; // alpha
			}
			if(showPixels && x >= x_acc){
				x_acc += scale;
			}
		}
		// Create image data structure
		let imgData = new ImageData(data, nx, ny);
		// Create new canvas to display image
		let canvas = document.createElement('canvas');
		canvas.width = nx;
		canvas.height = ny;
		if(id != ''){
			canvas.id = id;
		}
		let context = canvas.getContext('2d');
		// Put image data into canvas
		context.putImageData(imgData, 0, 0);
		return canvas;
	}

	/**
	 * Creates an ImageAccess object from an HTMLImageElement object
	 * @param {HTMLImageElement} htmlImageElement - The HTMLImageElement where the image is stored
	 * @returns {ImageAccess}
	 */
	static fromHTMLImageElement(htmlImageElement){
		let canvas = document.createElement('canvas');
		canvas.width = htmlImageElement.width;
		canvas.height = htmlImageElement.height;
		let context = canvas.getContext('2d');
		context.drawImage(htmlImageElement, 0, 0, htmlImageElement.naturalWidth, htmlImageElement.naturalHeight);
		let data = context.getImageData(0, 0, htmlImageElement.naturalWidth, htmlImageElement.naturalHeight).data;
		let img = new ImageAccess(htmlImageElement.height, htmlImageElement.width);
		for(let x=0; x < htmlImageElement.width; x++){
			for(let y=0; y < htmlImageElement.height; y++){
				let start_idx = (y*htmlImageElement.width + x)*4;
				let gray_value = parseInt((data[start_idx] + data[start_idx+1] + data[start_idx+2]) / 3);
				img.setPixel(x, y, gray_value);
			}
		}
		return img;
	}

	/**
	 * Maps the image to an 8-bit representation (range = [0,255])
	 * @returns {ImageAccess} The uint8 image
	 */
	toUint8(){
		let out = new ImageAccess(this.ny, this.nx);
		let min = this.getMin();
		let range = this.getMax() - min;
		for(let x=0; x < this.nx; x++){
		  for(let y=0; y < this.ny; y++){
			out.image[y][x] = parseInt((this.image[y][x] - min) / range * 255);
		  }
		}
		return out;
	}
}

class Nbh_Access{
	/**
	 * Returns a new object that can be used to access the specified neighbourhood of the image without creating a new image. This is mainly used by the ImageAccess.getNbh method
	 * @param {ImageAccess} IA_instance - The image of which the neighbourhood will be extracted
	 * @param {Integer} xc - The horizontal (x) center of the neighbourhood
	 * @param {Integer} yc - The vertical (y) center of the neighbourhood
	 * @param {Integer} nx - The width of the neighbourhood
	 * @param {Integer} ny - The height of the neighbourhood
	 * @param {String} [padding='mirror'] - The boundary condition to apply ('mirror', 'repeat' or 'zero') 
	 */
    constructor(IA_instance, xc, yc, nx, ny, padding='mirror'){
        // ImageAccess instance
        this.IA_instance = IA_instance;
		this.padding = padding;
        // Shape
        this.nx = nx;
        this.ny = ny;
        // Offset
        this.x_offset = xc - parseInt(nx/2);
        this.y_offset = yc - parseInt(ny/2);
    }

	/**
	 * Returns the pixel value at location (x,y) of the neighbourhood
	 * @param {Integer} x - The horizontal (x) location of the pixel
	 * @param {Integer} y - The vertical (y) location of the pixel
	 * @returns {Number} The value of the pixel at location (x,y)
	 */
    getPixel(x, y){
        // Check boundary
        if(x < this.nx && x >= 0 && y < this.ny && y >=0){
            // Return pixel at the offset location
            return this.IA_instance.getPixel(x + this.x_offset, y + this.y_offset, this.padding);
        }else{
            throw new Error('The pixel (x=' + x + ',y=' + y + ') is outside the neighborhood of size nx=' + this.nx + 
                            ', ny=' + this.ny + '.')
        }
    }
	
	/**
	 * Returns the row at position y of the neighbourhood
	 * @param {Integer} y - The vertical (y) position of the row
	 * @returns {ImageAccess} The row at position y
	 */
	getRow(y){
		if(y != parseInt(y)){
			throw new Error('Non-integer index provided in getRow');
		}
		// Check boundary
        if(y < this.ny && y >=0){
			var out_arr = new Array(this.nx);
			var y_adj = y + this.y_offset;
			for(var x = 0; x < this.nx; x++){
				out_arr[x] = this.IA_instance.getPixel(x + this.x_offset, y_adj, this.padding);
			}
            return new ImageAccess([out_arr]);
        }else{
            throw new Error('The row y=' + y + ' is outside the neighborhood of size nx=' + this.nx + 
                            ', ny=' + this.ny + '.')
        }
    }
    
	/**
	 * Returns the column at position x of the neighbourhood
	 * @param {Integer} x - The horizontal (x) position of the column
	 * @returns {ImageAccess} The column at position x
	 */
    getColumn(x){
		if(x != parseInt(x)){
			throw new Error('Non-integer index provided in getColumn');
		}
		// Check boundary
        if(x < this.nx && x >=0){
			var out_arr = new Array(this.ny);
			var x_adj = x + this.x_offset;
			for(var y = 0; y < this.ny; y++){
				out_arr[y] = this.IA_instance.getPixel(x_adj, y + this.y_offset, this.padding);
			}
            return new ImageAccess([out_arr]);
        }else{
            throw new Error('The column x=' + x + ' is outside the neighborhood of size nx=' + this.nx + 
                            ', ny=' + this.ny + '.')
        }
    }
	
	/**
	 * Returns a formatted string that can be used to display the neighbourhood in the console
	 * @param {Integer} [decimals=3] - The number of maximal decimals to use
	 * @returns {String} The neighourhood as a formatted string
	 */
	visualize(decimals=3){
		if(this.IA_instance.ndims() == 3){
            throw new Error("Visualization of RGB image is not yet implemented.")
        }
		// Determine needed length of strings
		var int_check = true;
		var pre_l = 0;
		var post_l = 0;
		for(var row=0; row < this.ny; row++){
			for(var col=0; col < this.nx; col++){
				if(int_check==true && !Number.isInteger(this.IA_instance.getPixel(col + this.x_offset, row + this.y_offset))){
					int_check = false;
				}
				var int_val = this.getPixel(col, row).toLocaleString('fullwide', {useGrouping:false, maximumFractionDigits:20}).split('.');
				pre_l = Math.max(pre_l, int_val[0].length);
				if(int_val.length > 1){
					post_l = Math.max(post_l, int_val[1].length);
				}
			}
		}
		decimals = Math.min(decimals, post_l);
		// Construct image string
		var msg = '[[ ';
		for(var row=0; row < this.ny; row++){
			if(row != 0){
				msg += '\n [ ';
			}
			for(var col=0; col < this.nx; col++){
				if(int_check==true){
					msg += this.IA_instance.getPixel(col + this.x_offset, row + this.y_offset).toString(10).padStart(pre_l, ' ') + ' ';
				}else if(decimals==0){
					msg += this.IA_instance.getPixel(col + this.x_offset, row + this.y_offset).toFixed(0).toString(10).padStart(pre_l, ' ') + ' ';
				}else{
					msg += this.IA_instance.getPixel(col + this.x_offset, row + this.y_offset).toFixed(decimals).toString(10).padStart(pre_l+decimals+1, ' ') + ' ';
				}
			}
			msg += ']';
		}
		msg += ']\n';
		return msg;
	}
	
	/**
	 * Returns the pixel values in ascending order
	 * @param {ImageAccess} [b] - The kernel. It should be the same size as the neighbourhood and contain 0s and 1s (or any other number), specifying which pixels are used during the sorting. By default, all pixels are used
	 * @returns {ImageAccess} The sorted pixels in ascending order
	 */
	sort(b){
        // if no structuring element given, use all pixels
        if(typeof(b) == 'undefined'){
            b = new ImageAccess(ImageAccess.MultidimArray(true, this.ny, this.nx));
        }
		// check if gray or color image is used
        if(this.IA_instance.ndims() == 2){
            var gray = new Array();
			// loop through every pixel
            for(var x=0; x < this.nx; x++){
                for(var y=0; y < this.ny; y++){
					// check if the pixel is under the structuring element
                    if(b.getPixel(x, y) > 0){
						// if yes, add the pixel to the output array
                        gray.push(this.getPixel(x, y));
                    }
                }
            }
			// sort the output array in ascending order
            gray.sort((a,b) => a-b);
			// return the sorted array
            return new ImageAccess([gray]);
        }else{
            var r_ = new Array();
            var g_ = new Array();
            var b_ = new Array();
			// loop through every pixel
            for(var x=0; x < this.nx; x++){
                for(var y=0; y < this.ny; y++){
					// check if the pixel is under the structuring element
                    if(b.getPixel(x, y) > 0){
						// if yes, add the pixel to the output array
                        r_.push(this.getPixel(x, y)[0]);
                        g_.push(this.getPixel(x, y)[1]);
                        b_.push(this.getPixel(x, y)[2]);
                    }
                }
            }
			// sort the output array in ascending order
            r_.sort((a,b) => a-b);
            g_.sort((a,b) => a-b);
            b_.sort((a,b) => a-b);
			// return the sorted array
            return [new ImageAccess([r_]), new ImageAccess([g_]), new ImageAccess([b_])];
        }
    }
	
}


// export the class to use it in other files
export default ImageAccess // ES6
// module.exports = ImageAccess
