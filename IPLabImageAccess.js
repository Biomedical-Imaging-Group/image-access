class IPLabImageAccess{
    // initializes a new blank image
    constructor(height, width = {}, {rgb=false, init_value=0} = {}, nbh=false){
		if(nbh == false){
			// check usage
			if(typeof(height) == 'undefined'){
				// if called without arguments, return without initializing the image
				return;
			// check if height an width are given separately
			}else if(IPLabImageAccess.ndims(height) == 0){
				if(height != parseInt(height) || width != parseInt(width)){
					throw new Error('Non-integer size provided in IPLabImageAccess constructor');
				}
				if(!rgb){
					// if rgb is false, initialize graylevel image
					this.image = IPLabImageAccess.MultidimArray(init_value, height, width);
				}else{
					// if rgb is true, initialize color image
					this.image = IPLabImageAccess.MultidimArray(init_value, height, width, 3);
				}
			// check if height an width are given as an array
			}else if(IPLabImageAccess.ndims(height) == 1 && (height.length == 2 || height.length == 3)){
				// in this case, the optional parameters are stored in width
				rgb = width.rgb || false;
				init_value = width.init_value || 0;
				// height and width given as a an array
				if(height[0] != parseInt(height[0]) || height[1] != parseInt(height[1])){
					throw new Error('Non-integer size provided in IPLabImageAccess constructor');
				}
				if(rgb || (height.length == 3 && height[2] == 3)){
					this.image = IPLabImageAccess.MultidimArray(init_value, height[0], height[1], 3);
				}else{
					this.image = IPLabImageAccess.MultidimArray(init_value, height[0], height[1]);
				}
			// check if the image is given as an array
			}else if(IPLabImageAccess.ndims(height) == 2 || IPLabImageAccess.ndims(height) == 3){
				// initialize from array
				this.fromArray(height);
			}else{
				throw new Error("Unrecognized input data in IPLabImageAccess constructor");
			}
			// assign image sizes
			this.nx = IPLabImageAccess.shape(this.image)[1];
			this.ny = IPLabImageAccess.shape(this.image)[0];
			// initialize min and max
			this.min = this.getMin(true);
			this.max = this.getMax(true);
			this.change_check = false;
		}else{
			this.change_check = true;
		}
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
        this.nx = IPLabImageAccess.shape(this.image)[1];
        this.ny = IPLabImageAccess.shape(this.image)[0];
		// recalculate min and max
		this.min = this.getMin(true);
		this.max = this.getMax(true);
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
        return [this.ny, this.nx];
    }

    // Creates a new 1D/2D/3D array and initializes it to init_value
    static MultidimArray(init_value, height, width, depth){
		if(height != parseInt(height) || width != parseInt(width)){
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

    // returns the neighbourhood of an array
    static getNbh(img, x_pos, y_pos, nx, ny, padding = 'mirror'){
		if(x_pos != parseInt(x_pos) || y_pos != parseInt(y_pos)){
			throw new Error('Non-integer index provided in getNbh');
		}
		if(nx != parseInt(nx) || ny != parseInt(ny)){
			throw new Error('Non-integer size provided in getNbh');
		}
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
				// apply boundary condition to indexes
                [x_offset, y_offset] = IPLabImageAccess.applyBoundaryCondition(x_offset, y_offset, shap=shap, padding=padding)
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
    
    // returns the neighbourhood of the image
    getNbh(x_pos, y_pos, nx, ny, padding = 'mirror'){
		if(x_pos != parseInt(x_pos) || y_pos != parseInt(y_pos)){
			throw new Error('Non-integer index provided in getNbh');
		}
		if(nx != parseInt(nx) || ny != parseInt(ny)){
			throw new Error('Non-integer size provided in getNbh');
		}
        var neigh = IPLabImageAccess.MultidimArray(0, ny, nx);
        for(var y = 0; y < ny; y++){  
            for(var x = 0; x < nx; x++){
                // calculate x and y position offset
                var y_offset = y_pos - parseInt(ny/2) + y;
                var x_offset = x_pos - parseInt(nx/2) + x;
				// apply boundary condition to indexes
                [x_offset, y_offset] = IPLabImageAccess.applyBoundaryCondition(x_offset, y_offset, [this.ny, this.nx], padding)
				// assign pixel to the neighbourhood
				if(x_offset == -1 || y_offset == -1){
					// zero padding 
					neigh[y][x] = IPLabImageAccess.ndims(this.image) == 3 ? [0, 0, 0] : 0;
				}else{
					// other padding
					neigh[y][x] = this.image[y_offset][x_offset];
				}
                
            }
        }
		// Create new image (optimized version)
		var out = new IPLabImageAccess(0, 0, {}, true);
		out.image = neigh;
		out.nx = nx;
		out.ny = ny;
        return out;
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
    getMax(recalc=false){
		if(recalc==true){
			// apply getMax to the image
			this.max = IPLabImageAccess.getMax(this.image);
		}else if(this.change_check==true || typeof(this.max) == 'undefined'){
			// apply getMax to the image
			this.max = IPLabImageAccess.getMax(this.image);
			// also rerun getMin
			this.min = IPLabImageAccess.getMin(this.image);
			// reset change_check
			this.change_check = false;
		}
		return this.max;
    }
    
    // returns the minimum value of the image
    getMin(recalc=false){
		if(recalc==true){
			// apply getMin to the image
			this.min = IPLabImageAccess.getMin(this.image);
		}else if(this.change_check==true || typeof(this.max) == 'undefined'){
			// also rerun getMax
			this.max = IPLabImageAccess.getMax(this.image);
			// apply getMin to the image
			this.min = IPLabImageAccess.getMin(this.image);
			// reset change_check
			this.change_check = false;
		}
		return this.min;
		
    }
    
	// normalize the image statics
    normalize(){
		// initialize parameters
        var output = new IPLabImageAccess([this.ny, this.nx])
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
    // returns the pixel at position (x,y)
    getPixel(x, y, padding='mirror'){
		if(x != parseInt(x) || y != parseInt(y)){
			throw new Error('Non-integer index provided in getPixel');
		}
        // apply boundary conditions
		[x, y] = IPLabImageAccess.applyBoundaryCondition(x, y, [this.ny, this.nx], padding=padding);
        if(x == -1 || y == -1){
			// zero padding
			return IPLabImageAccess.ndims(this.image) == 3 ? [0, 0, 0] : 0;
		}else{
			// other padding
			return this.image[y][x];
		}
    }
    
    // sets the pixel value at location (x,y)
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
        [x,y] = IPLabImageAccess.applyBoundaryCondition(x, y, shap, padding=padding)
        this.image[y][x] = value;
		// reset change_check
		this.change_check = true;
    }
    
    
    getRow(y, padding = 'mirror'){
		if(y != parseInt(y)){
			throw new Error('Non-integer index provided in getRow');
		}
		// initialize parameters
        var y_orig = y;
        var out_of_bounds = false
        var rgb = false;     
        if(IPLabImageAccess.ndims(this.image) == 3){
            rgb = true;
        }
        // padding
        y = IPLabImageAccess.applyBoundaryCondition(0, y, [this.ny, this.nx], padding=padding)[1]
        if(y == -1){
			// if zero padding should be applied, return a row of zeros
			return rgb ? new IPLabImageAccess([new Array(this.nx).fill([0, 0, 0])]) : new IPLabImageAccess([new Array(this.nx).fill(0)]);
        }else{
			return new IPLabImageAccess([this.image[y]]);
		}
    }
    
    getColumn(x, padding = 'mirror'){
		if(x != parseInt(x)){
			throw new Error('Non-integer index provided in getColumn');
		}
		// initialize parameters
        var out_of_bounds = false
        var rgb = false;     
        if(IPLabImageAccess.ndims(this.image) == 3){
            rgb = true;
        }
        // padding
        x = IPLabImageAccess.applyBoundaryCondition(x, 0, [this.ny, this.nx], padding=padding)[0]
        if(x == -1){
			// if zero padding should be applied, return a column of zeros
			return rgb ? new IPLabImageAccess([new Array(this.nx).fill([0, 0, 0])]) : new IPLabImageAccess([new Array(this.nx).fill(0)]);
        }else{
			// extract column
			return new IPLabImageAccess([this.image.map(function(element) {return element[x];})]);
		}
    }
    
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
        if(this.ndims() == 2 && Image.ndims(new_row) == 2 && Image.shape(new_row)[1] == 3){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing an rgb value to a grayscale image converts this pixel to rgb.")
        }
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 3 && Image.ndims(new_row) == 2){
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
        y = IPLabImageAccess.applyBoundaryCondition(0, y, [this.ny, this.nx], padding=padding)[1];
		// insert new row
		if(is_row == true){
			this.image[y] = new_row.image[0];
		}else{
			for(var x=0; x < this.nx; x++){
				this.image[y][x] = new_row.image[x][0];
			}
		}
        // reset change_check
		this.change_check = true;
    }
    
    
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
        if(this.ndims() == 2 && Image.ndims(new_column) == 2 && Image.shape(new_column)[1] == 3){
            // otherwise provide a warning but still set the pixel
            console.warn("Writing an rgb value to a grayscale image converts this pixel to rgb.")
        }
        // check if the correct type of pixel is provided (colour / gray)
        if(this.ndims() == 3 && Image.ndims(new_column) == 1){
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
        x = IPLabImageAccess.applyBoundaryCondition(x, 0, [this.ny, this.nx], padding=padding)[0];
		
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
		this.change_check = true;
    }
    
	// returns the transpose of an array
    static transpose(array){
		// map the rows to the columns
        return array[0].map((x,i) => array.map(x => x[i]))
    }
    
	// returns the transpose of the image
    transposeImage(){
		// apply transpose to the image
        this.image = IPLabImageAccess.transpose(this.image) 
		var old_nx = this.nx;
		this.nx = this.ny;
		this.ny = old_nx;
    }
	
	// function that checks if there is a normalization error between the arrays img1 and img2
	static isNormalizationError(img1, img2, c={'c':null}, tol=1e-3){
		// check if the array have the same size
		if(img1.length != img2.length){
			return false;
		}
		for(var i in img1){
		    // Don't forget to check for arrays in our arrays.
			if(img1[i] instanceof Array && img2[i] instanceof Array) {
				if(!IPLabImageAccess.isNormalizationError(img1[i], img2[i], c)){
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
	
	isNormalizationError(img){
		return IPLabImageAccess.isNormalizationError(this.image, img.image);
    }
    
	// compares two arrays
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
				if(!IPLabImageAccess.arrayCompare(a1[i], a2[i], err, tol, utilObj)){
					check_err = true;
					if(!IPLabImageAccess.isNormalizationError(a1[i], a2[i], c)){
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
    imageCompare(newImage, err, tol){
		// apply arrayCompare to the two images
        return IPLabImageAccess.arrayCompare(newImage.image, this.image, err, tol);
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
            return new IPLabImageAccess([gray]);
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
            return [new IPLabImageAccess([r_]), new IPLabImageAccess([g_]), new IPLabImageAccess([b_])];
        }
    }
    
	// create a copy of the image
    copy(){
        return new IPLabImageAccess(this.image);
    }
    
	// put a sub-image into the image
    putSubImage(x, y, img){
		if(x != parseInt(x) || y != parseInt(y)){
			throw new Error('Non-integer index provided in putSubImage');
		}
		// check if the sub-image location is inside the image
        if(x < 0 || y < 0 || x+img.nx > this.nx || x+img.ny > this.ny){
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
		this.change_check = true;		
    }
	
	    getSubImage(x, y, nx, ny){
        if(x != parseInt(x) || y != parseInt(y)){
			throw new Error('Non-integer index provided in putSubImage');
		}
        // check if the sub-image location is inside the image
        if(x < 0 || y < 0 || x+nx > this.nx || x+ny > this.ny){
           throw new Error("Subimage out of bounds");
        }
        var output = new IPLabImageAccess(ny, nx);
        
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
	
	// returns the image as a formatted string that can be displayed on the console
	visualize(decimals=3){
		if(this.ndims(this.image) == 3){
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
			msg += ']'
		}
		msg += ']\n'
		return msg
	}
}


// export the class to use it in other files
module.exports = IPLabImageAccess


/* Notes and bugs
The code is currently bug-free, unlike my appartment...
*/ 
