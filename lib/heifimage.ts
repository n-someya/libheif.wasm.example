export class HeifImage {
    libheif: any
    handle: any
    img: any
    data: any

    constructor(libheif: any, handler: any) {
        this.libheif = libheif
        this.handle = handler
        this.img = null
    }

    _ensureImage() {
        if (this.img) {
            return;
        }
        debugger
        // var img = this.libheif.heif_js_decode_image(this.handle,
        //     this.libheif.heif_colorspace.heif_colorspace_YCbCr, this.libheif.heif_chroma.heif_chroma_420);
        var img = this.libheif.heif_js_decode_image(this.handle,
            this.libheif.heif_colorspace.heif_colorspace_RGB, this.libheif.heif_chroma.heif_chroma_interleaved_RGB);
        if (!img || img.code) {
            console.log("Decoding image failed", this.handle, img);
            return;
        }
        debugger
        this.data = new Uint8Array(this.StringToArrayBuffer(img.data));
        delete img.data;
        this.img = img;
    }

    display(image_data: ImageData, callback: Function) {
        // Defer color conversion.
        const w = this.img.width
        const h = this.img.height
        if (!this.img) {
            // Decoding failed.
            callback(null);
            return;
        }
        var yval;
        var uval;
        var vval;
        var xpos = 0;
        var ypos = 0;
        var yoffset = 0;
        var uoffset = 0;
        var voffset = 0;
        var x2;
        var i = 0;
        var maxi = w*h;
        var stridey = w;
        var strideu = Math.ceil(w / 2);
        var stridev = Math.ceil(w / 2);
        var h2 = Math.ceil(h / 2);
        var y = this.data;
        var u = this.data.subarray(stridey * h, stridey * h + (strideu * h2));
        var v = this.data.subarray(stridey * h + (strideu * h2), stridey * h + (strideu * h2) + (stridev * h2));
        debugger
        var dest = image_data.data;
        while (i < maxi) {
            x2 = (xpos >> 1);
            yval = 1.164 * (y[yoffset + xpos] - 16);

            uval = u[uoffset + x2] - 128;
            vval = v[voffset + x2] - 128;
            dest[(i<<2)+0] = yval + 1.596 * vval;
            dest[(i<<2)+1] = yval - 0.813 * vval - 0.391 * uval;
            dest[(i<<2)+2] = yval + 2.018 * uval;
            dest[(i<<2)+3] = 0xff;
            i++;
            xpos++;

            if (xpos < w) {
                yval = 1.164 * (y[yoffset + xpos] - 16);
                dest[(i<<2)+0] = yval + 1.596 * vval;
                dest[(i<<2)+1] = yval - 0.813 * vval - 0.391 * uval;
                dest[(i<<2)+2] = yval + 2.018 * uval;
                dest[(i<<2)+3] = 0xff;
                i++;
                xpos++;
            }
            if (xpos === w) {
                xpos = 0;
                ypos++;
                yoffset += stridey;
                uoffset = ((ypos >> 1) * strideu);
                voffset = ((ypos >> 1) * stridev);
            }
        }
        callback(image_data);
    }

    StringToArrayBuffer(str: string) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i=0, strLen=str.length; i<strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

}


export class HeifDecoder {
    libheif: any
    decoder: any
    constructor(libheif: any) {
        this.libheif = libheif;
        this.decoder = null;
    }

    decode(buffer: any) {
        if (this.decoder) {
            this.libheif.heif_context_free(this.decoder);
        }
        this.decoder = this.libheif.heif_context_alloc();
        if (!this.decoder) {
            console.log("Could not create HEIF context");
            return [];
        }
        var error = this.libheif.heif_context_read_from_memory(this.decoder, buffer);
        if (error.code !== this.libheif.heif_error_code.heif_error_Ok) {
            console.log("Could not parse HEIF file", error);
            return [];
        }

        debugger
        var ids = this.libheif.heif_js_context_get_list_of_top_level_image_IDs(this.decoder);
        if (!ids || ids.code) {
            console.log("Error loading image ids", ids);
            return [];
        }
        else if (!ids.length) {
            console.log("No images found");
            return [];
        }

        var result = [];
        for (var i = 0; i < ids.length; i++) {
            var handle = this.libheif.heif_js_context_get_image_handle(this.decoder, ids[i]);
            if (!handle || handle.code) {
                console.log("Could not get image data for id", ids[i], handle);
                continue;
            }

            result.push(new HeifImage(this.libheif, handle));
        }
        return result;
    }
}
