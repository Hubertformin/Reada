const { Notify }  = require('./js/modules/Notifications');
const { BookReader }  = require('./js/modules/BookReader');
const notify = new Notify();

var app = angular.module("App",["ngRoute"]);
app.config(($routeProvider)=>{
    $routeProvider
    .when("/",{
        templateUrl:"components/recent.html"
    })
    .when("/recent",{
        templateUrl:"components/recent.html"
    })
    .when("/library",{
        templateUrl:"components/library.html"
    })
    .when("/store",{
        templateUrl:"components/store.html"
    })
    .when("/my_books",{
        templateUrl:"components/my_books.html"
    })
        .when("/account",{
            templateUrl:"components/account.html"
        })

});
app.filter('orderObjectBy',()=>{
    return function (items,field,reverse) {
        var filtered = [];
        angular.forEach(items,(item)=>{
            filtered.push(item);
        })
        filtered.sort((a,b)=>{
            return(a[field] > b[field] ? 1: -1);
        });
        if(reverse) filtered.reverse();
        return filtered;
    }
});
app.controller("mainCtr",($scope)=>{
    //getting reade
    $scope.BookReader = new BookReader("#bookReader");
    //bookreader change sections
    $("#bookSections").change((e)=>{
        $scope.BookReader.changeSection(Number(e.target.value));
    });
    //read book
    $scope.openBook = (book)=>{
        $scope.BookReader.open(book.bookID).then((data)=>{
            book.readTime = Date.now();
            $scope.db.myBooks.put(book).then(()=>{
                console.log("Read time saved!");
            })
            $scope.$apply()
        }).catch(err=>{
            notify.warning(`Book not found! <br/>Possible cause: Deleted by another program!`);
        })
    }

    const {ipcRenderer} = require("electron");
    M.AutoInit();
    $('#account_tabs').waitMe({
        effect : 'pulse',
        text : 'Loading...',
        bg : 'rgba(255,255,255,1)',
        color : '#004d40',
        waitTime : -1,
        textPos : 'vertical',
        fontSize : '16px',
    });
        var elem = document.querySelector("#settings");
        var instances = M.Sidenav.init(elem,{
            edge:'right'
        });
        //expanding login
        $scope.expandLogin = (mode)=>{
            var img = $('#loginLogoPic');
            if (mode) {
                img.css({height:'55px',width:"auto"})
            }else{
                img.css({height:'auto',width:"auto"})
            }
        }
        //variavbles
        $scope.currentUser = {};
        $scope.users = [];
        $scope.myBooks = [];
        //reading database
        var Dexie = require('dexie');
        $scope.db = new Dexie('ReadbryDB');
        $scope.db.version(1).stores({
            myBooks:"++id,author,&bookID,category,data,creationDate,cover_url,description,path,title",
            users:"++userID,fname,lname,username,phone,password",
            library:"++id",
        });
        $scope.db.transaction('rw',$scope.db.myBooks,$scope.db.users,()=>{
            $scope.db.users.toArray()
                .then((data)=>{
                    $scope.users = data;
                })
            $scope.db.myBooks.toArray()
                .then((data)=>{
                    $scope.myBooks = data;
                })
        }).then(()=>{
            if(localStorage.getItem("user") !== null) {
                $scope.currentUser = JSON.parse(localStorage.getItem("user"));
                $scope.$apply();
                if($scope.users.length === 0) {
                    $scope.db.transaction('rw',$scope.db.users,()=>{
                        $scope.currentUser.image = "img/user.png";
                        $scope.db.users.put($scope.currentUser)
                            .then(()=>{
                                $scope.db.users.get($scope.currentUser.userID,(user)=>{
                                    $scope.currentUser = user;
                                    $scope.currentUser.img_url = "img/user.png";
                                    $scope.$apply();
                                    $('section#account').fadeOut("fast");
                                });
                            })
                    }).catch((err)=>{
                        console.error(err);
                        notify.error("Unable read your data!");
                    })
                }else{
                    //getting picture
                    console.log($scope.currentUser.userID);
                    $scope.db.users.get($scope.currentUser.userID,(user)=>{
                        $scope.currentUser = user;
                        if(typeof $scope.currentUser.image === "object") {
                            $scope.currentUser.img_url = URL.createObjectURL($scope.currentUser.image);
                        }else{
                            $scope.currentUser.img_url = "img/user.png";
                        }
                        localStorage.setItem("user",JSON.stringify(user));
                        $scope.$apply();
                    }).catch((err)=>{
                        console.log(err);
                    })
                    $('section#account').fadeOut("fast");
                    $('#account_tabs').waitMe("hide");
                }
            }
        }).then(()=>{
            $scope.$apply();
            if($scope.users.length === 0 && localStorage.getItem("user") === null){
                $('#account_tabs').css({visibility:"visible"});
                $('#account_tabs').waitMe("hide");
                $('.tab > a').removeClass("active");
                document.querySelector('#create-tab').click();
            }else if($scope.users.length !== 0 && localStorage.getItem("user") === null){
                $('#account_tabs').css({visibility:"visible"});
                $('#account_tabs').waitMe("hide");
            }
        }).catch((err)=>{
            console.error(err);
            notify.error("Unable to read Database!");
        })
        //get account
        //create acoount
        const account = {
            login:({username,password})=>{
                $scope.db.transaction('rw',$scope.db.users,()=>{
                    $scope.db.users.where({username:username,password:password}).first((user)=>{
                        if (typeof user !== "object") {
                            notify.warning("Username or incorrect password!");
                            return;
                        }
                        $scope.currentUser = user;
                        if(typeof $scope.currentUser.image === "object") {
                            $scope.currentUser.img_url = URL.createObjectURL($scope.currentUser.image);
                        }else{
                            $scope.currentUser.img_url = "img/user.png";
                        }
                        $scope.$apply();
                        localStorage.setItem("user",JSON.stringify(user));
                        $('section#account').fadeOut("fast");
                    })
                }).catch((err)=>{
                    console.error(err);
                })
            },
            create:({fname,lname,username,phone,password})=>{
                    $scope.db.transaction('rw',$scope.db.users,()=>{
                        $scope.db.users.put({fname:fname,lname:lname,username:username,password:password,phone:phone})
                        $scope.db.users.toArray()
                            .then((data)=>{
                                $scope.users = data;
                                $scope.currentUser = data[0];
                                $scope.currentUser.img_url = "img/user.png";
                                localStorage.setItem("user",JSON.stringify($scope.currentUser));
                                $('section#account').fadeOut("fast");
                            })
                    }).then(()=>{
                        $scope.$apply();
                    }).catch((err)=>{
                        console.error(err);
                    })
            }
        }
        //events
        $('#signUpForm').on('submit',(e)=>{
            e.preventDefault();
            if(typeof $scope.fname !== 'string' || $scope.fname === "") {
                notify.warning("Enter your first name!");
                return;
            }
            if(typeof $scope.lname !== 'string' || $scope.lname === "") {
                notify.warning("Enter your last name!");
                return;
            }
            if(typeof $scope.n_username !== 'string' || $scope.n_username === "") {
                notify.warning("Enter a username!");
                return;
            }
            if(typeof $scope.tel !== 'number' || $scope.tel === "") {
                notify.warning("Enter your phone number!");
                return;
            }
            if(typeof $scope.n_password !== 'string' || $scope.n_password == "" || $scope.n_password !== $scope.c_password) {
                notify.warning("Invalid password or passwords do not match");
                return;
            }
            //creating account
            account.create({
                fname:$scope.fname,
                lname:$scope.lname,
                password:$scope.n_password,
                phone:$scope.tel,
                username:$scope.n_username
            })
        })
        //login form
        $('#loginForm').on('submit',(e)=>{
            e.preventDefault();
            if(typeof $scope.username !== 'string' || $scope.username === "") {
                notify.warning("Enter your first name!");
                return;
            }
            if(typeof $scope.password !== 'string' || $scope.password === "") {
                notify.warning("Enter your last name!");
                return;
            }
            //creating account
            account.login({
                username:$scope.username,
                password:$scope.password
            })
        })

        //==================== FUNCTIONS =================
        $scope.timeAgo = (time)=>{
            var now = Date.now(),ago = Number(time),
                diff = now - ago;
            if(diff < 0) return null;
            //
            //time ariables
            var seconds = Math.floor(diff/1000),
                minutes = Math.floor(diff/(1000* 60)),
                hours = Math.floor(diff/(1000 * 60 * 60)),
                days = Math.floor(diff/(1000 * 60 * 60 * 24)),
                weeks = Math.floor(diff/(1000 * 60 * 60 * 24 * 7)),
                months = Math.floor(diff/(1000 * 60 * 60 * 24 * 30)),
                years = Math.floor(diff/(1000 * 60 * 60 * 24 * 30 * 12));

            if(seconds <= 60){
                return "Just now";
            }else if(minutes <= 60){
                return (minutes === 1)?'A min ago':`${minutes} minutes ago`;
            }else if(hours < 24){
                return (hours === 1)?'An Hour ago':`${hours} hours ago`;
            }else if(days < 7){
                return (days === 1)?'Yesterday':`${days} days ago`;
            }else if(weeks < 4.3){
                return (weeks === 1)?'A week ago':`${weeks} weeks ago`;
            }else if(months < 12){
                return (months === 1)?'A month ago':`${months} months ago`;
            }else{
                return (years === 1)?'A Year ago':`${years} years ago`;
            }
        }

    

})