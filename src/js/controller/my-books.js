const Cryptr = require('cryptr');
const fs = require('fs');
const libCryptr = new Cryptr('LibraryKey');

app.controller("myBooksCtr",($scope)=>{
    //backu
    const {ipcRenderer} = require("electron");
    var elems = document.querySelectorAll('.modal');
    M.Modal.init(elems);
    //default variables
    $scope.bookListView = true;
    $scope.createNewBookBtn = true;
    $scope.updateBook = {};
    //back up to localDatabase
    function localBooksBackup(data) {
        const book = libCryptr.encrypt(JSON.stringify(data));
        fs.writeFile("bin/publications/config.sb",book,(err)=>{
            if(err) console.error(err);
        })
    }
    //load books
    function loadBooks() {
        $scope.db.transaction('rw',$scope.db.myBooks,()=>{
            $scope.db.myBooks.toArray()
                .then((data) => {
                    $scope.myBooks = data;
                    $scope.myBooks = $scope.myBooks.filter(book=>{
                        return book.authorID === $scope.currentUser.userID;
                    });
                    if(data.length !== 0) {
                        localBooksBackup(data);
                    }
                    $scope.$apply();
                }).catch((err) => {
                notify.error("Failed to load books!");
                console.error(err);
            })
        })
    }
    loadBooks();
    //launch editor window
    $scope.launchEditor = ({title,bookID})=>{
        fs.exists(`bin/publications/pub-${bookID}.rby`,exists => {
            if (exists) {
                ipcRenderer.send('launchEditor', JSON.stringify({title,bookID}));
            } else {
                //notify.warning(`Book not found! <br/>Possible cause: Deleted by another program!`);
            }
        })
    };
    //open create book modal
    $scope.openCreateModal = ()=>{
        $scope.createNewBookBtn  = true;
        let modal = M.Modal.getInstance($("#createBook"));
        $scope.bookTitle = "";
        $scope.bookDescription = "";
        $scope.bookCategory = "";
        modal.open();
        modal = null;
    }
    //create book
    $scope.createBook = ()=>{
        if(typeof $scope.bookTitle !== 'string' || $scope.bookTitle === ""){
            M.toast({html:"Enter title!"});
            return;
        }
        if(typeof $scope.bookDescription !== 'string' || $scope.bookDescription === ""){
            M.toast({html:"Enter description!"});
            return;
        }
        if(typeof $scope.bookCategory !== 'string' || $scope.bookCategory === ""){
            M.toast({html:"Enter category!"});
            return;
        }
        $scope.bookID = Math.floor(Math.random() * 8999) + 1000;
        //creating book
        let currentBook = {
            author:`${$scope.currentUser.fname} ${$scope.currentUser.lname}`,
            authorID:$scope.currentUser.userID,
            contents:[
                {title:'Untitled1',content:''}
            ],
            currentSection:0,
            description:$scope.bookDescription,
            category:$scope.bookCategory,
            id:$scope.bookID,
            title:$scope.bookTitle,
        };
        let bookData = libCryptr.encrypt(JSON.stringify(currentBook));
        fs.writeFile(`bin/publications/pub-${$scope.bookID}.rby`,bookData,(err)=>{
            if(err) {
                console.error(err)
                notify.error("Unable to create book!");
            }else{
                //saving to database
                $scope.db.transaction('rw',$scope.db.myBooks,()=>{
                    $scope.db.myBooks.put({
                        author:currentBook.author,
                        authorID:currentBook.authorID,
                        bookID:currentBook.id,
                        category:currentBook.category,
                        cover_url:null,
                        creationDate:Date.now(),
                        date:Date.now(),
                        description:currentBook.description,
                        path:`pub-${$scope.bookID}.rby`,
                        title:currentBook.title
                    });
                    loadBooks();
                }).then(()=>{
                    console.log("saved!");
                    $scope.createNewBookBtn = true;
                    $scope.$apply();
                }).catch((err)=>{
                    console.error(err);
                    notify.error("Failed to save book");
                })
            }
        });
        //launching editor
        $scope.launchEditor({
            title:$scope.bookTitle,
            bookID:$scope.bookID
        });
        document.querySelector('#createBookForm').reset();
        let modal = M.Modal.getInstance($("#createBook"));
        modal.close();
        modal = null;
    };
    //create book form
    $('#createBookForm').on('submit',(e)=>{
        e.preventDefault();
        if($scope.createNewBookBtn) {
            $scope.createBook();
        }else{
            if(typeof $scope.bookTitle !== 'string' || $scope.bookTitle === ""){
                M.toast({html:"Enter title!"});
                return;
            }
            if(typeof $scope.bookDescription !== 'string' || $scope.bookDescription === ""){
                M.toast({html:"Enter description!"});
                return;
            }
            if(typeof $scope.bookCategory !== 'string' || $scope.bookCategory === ""){
                M.toast({html:"Enter category!"});
                return;
            }
            //updating
            $scope.db.transaction('rw',$scope.db.myBooks,()=>{
                $scope.db.myBooks.put({
                    id:$scope.updateBook.id,
                    author:`${$scope.currentUser.fname} ${$scope.currentUser.lname}`,
                    authorID:$scope.currentUser.userID,
                    bookID:$scope.updateBook.bookID,
                    category:$scope.bookCategory,
                    readTime:$scope.updateBook.readTime,
                    creationDate:$scope.updateBook.creationDate,
                    cover_url:null,
                    path:`pub-${$scope.updateBook.bookID}.rby`,
                    date:Date.now(),
                    description:$scope.bookDescription,
                    title:$scope.bookTitle
                });
                loadBooks();
            }).then(()=>{
                console.log("saved!");
                M.Modal.getInstance($("#createBook")).close();
                $scope.createNewBookBtn = true;
                $scope.$apply();
            }).catch((err)=>{
                console.error(err);
                notify.error("Failed to save book");
            })
        }

    })
    //book settings
    $scope.bookSettings = (i)=>{
        console.log($scope.myBooks,i);
        $scope.createNewBookBtn = false;
        let modal = M.Modal.getInstance($("#createBook"));
        $scope.bookTitle = $scope.myBooks[i].title;
        $scope.bookCategory = $scope.myBooks[i].category;
        $scope.bookDescription = $scope.myBooks[i].description;
        $scope.updateBook = $scope.myBooks[i];
        modal.open();
    }
    //edit book
    $scope.editBook = (book)=>{
        book.date = Date.now();
        $scope.db.myBooks.put(book)
            .then(()=>{
                loadBooks();
                $scope.launchEditor({title:book.title,bookID:book.bookID});
            }).catch((err)=>{
                console.log(err);
        })
    };
    //delete book
    $scope.deleteBook = (book)=>{
        const path = `bin/publications/pub-${book.bookID}.rby`;
        const modal = M.Modal.getInstance($('#deleteBookModal'));
        modal.open();
        $('#deleteBookBtn').off("click").on("click",(e)=>{
            if(typeof $scope.deleteBookName !== "string" || $scope.deleteBookName === "") {
                modal.close();
                return;
            }
            if($scope.deleteBookName !== book.title){
                console.log($scope.deleteBookName,book.title);
                notify.warning("Wrong Title!");
                modal.close();
                return;
            }
            $scope.db.transaction("rw",$scope.db.myBooks,()=>{
                $scope.db.myBooks.delete(book.id);
                loadBooks();
            }).then(()=>{
                $scope.deleteBookName = "";
                fs.unlink(path,(err)=>{
                    if(err) {
                        console.error(err);
                    };
                    notify.info("Book was deleted!");
                    modal.close();
                })
            }).catch((err)=>{
                console.error(err);
            })

        });
    }
    //to chage book view
    $scope.changeBookView = ()=>{
        $scope.bookListView = !$scope.bookListView;
    }

    //TODO Open Book function was placed in controller js for global purposes
});