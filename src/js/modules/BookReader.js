const fs = require('fs');
const Cryptr = require('cryptr');
const libCryptr = new Cryptr('LibraryKey');

class BookReader {
    constructor(sel) {
        this.el = $(sel);
        this.book = "";
        this.fistsChapter = "";
        this.reader = this.el.find('#reader');
        this.title = this.el.find(".bookTitle");
        this.sections = this.el.find("#bookSections");
    }
    open(bookID) {
        return new Promise((resolve,reject)=>{
            const file = `bin/publications/pub-${bookID}.rby`;
            fs.readFile(file,(err,data)=>{
                if(err) {
                    reject();
                }
                this.book = JSON.parse(libCryptr.decrypt(data));
                this.title.html(this.book.title);
                this.reader.html(this.book.contents[0].content);
                this.sections.html("");
                for(let i = 0;i < this.book.contents.length;i++) {
                    this.sections.append(`<option value="${i}">${this.book.contents[i].title}</option>`);
                }
                //setting the details modal
                this.el.find(".category").html(this.book.category);
                this.el.find(".description").html(this.book.description);
                this.el.find(".author").html(this.book.author);
                this.el.show("fast");
                resolve(this.book);
            })
        })
    }
    changeSection(i) {
        this.reader.html(this.book.contents[i].content);
    }
    close() {
        this.el.hide("fast");
    }
}
//exporting
module.exports = {
    BookReader
}