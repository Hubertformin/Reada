class FadeToggler {
    constructor(el) {
        this.el = $(el);
    }
    open(speed = "fast",callback) {
        this.el.fadeIn(speed,()=>{
            if(typeof callback === "function") {
                callback();
            }
        });
    }
    close(speed = "fast",callback) {
        this.el.fadeOut(speed,()=>{
            if(typeof callback === "function") {
                callback();
            }
        })
    }
}

