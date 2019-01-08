app.controller("accountCtr",($scope)=>{
   angular.element(document).ready(()=>{
       //variables
       $scope.editUserBtn = false;
       $scope.currentBooks = [];
       $scope.currentPublications = [];
       //Database languange
       $scope.db.transaction("rw",$scope.db.users,$scope.db.myBooks,()=>{
           $scope.db.users.get($scope.currentUser.userID,(user)=>{
               $scope.currentUser = user;
               if (typeof user.image === "object" && user.image !== {}) {
                   $scope.currentUser.img_url = URL.createObjectURL($scope.currentUser.image);
                  // document.querySelector("#main_user_img").src = $scope.currentUser.img_url;
               }
               localStorage.setItem("user",JSON.stringify(user));
               //$scope.$apply();
           });
           //Get books authored by current user
           $scope.db.myBooks.toArray()
               .then((data)=>{
                   $scope.currentBooks = data.filter((el)=>{
                       return Number(el.authorID) === Number($scope.currentUser.userID);
                   });
               })
       }).then(()=>{
           $scope.$apply();
       }).catch((err)=>{
           console.error(err);
       });

       //function
       $scope.editUser = ()=>{
           $scope.editUserBtn = true;
           //passing curent user to
           //scroll to bottom of container
           $('#sub-body').stop().animate({
               scrollTop: $('#sub-body').scrollHeight
           }, 800);
       };
       //functions
       //1. select profile image
       $scope.selectProfileImg = ()=>{
           document.querySelector("#profileImgInput").click();
       }
       //2. listen to user update image
       $('#profileImgInput').on('change',(e)=>{
           const file = e.target.files[0];
           if(typeof file === 'object'){
               var img = document.querySelector('#profileImg');
               if(Math.floor(file.size / 1000000) > 10){
                   notify.info("For performance reasons, consider selecting a file less than 10MB!",3000);
                   return;
               }
               const image = new Blob([file],{type:file.type});
               //saving image to database
               $scope.db.transaction('rw',$scope.db.users,()=>{
                   $scope.currentUser.image = image;
                   $scope.db.users.put($scope.currentUser)
                       .then(()=>{
                           $scope.db.users.get($scope.currentUser.userID,(user)=>{
                               $scope.currentUser = user;
                               if (typeof user.image === "object" && user.image !== {}) {
                                   $scope.currentUser.img_url = URL.createObjectURL($scope.currentUser.image);
                                   document.querySelector("#main_user_img").src = $scope.currentUser.img_url;
                               }
                               localStorage.setItem("user",JSON.stringify(user));
                               //$scope.$apply();
                           });
                       })
               }).then(()=>{
                   $scope.$apply();
               }).catch((err)=>{
                   console.error(err);
               })

           }

       });
       //2. Update user
       $scope.updateUser = ()=>{
            if(typeof $scope.currentUser.fname !== 'string' || $scope.currentUser.fname == "") {
               notify.warning("Enter your first name.");
               return;
           }
            if(typeof $scope.currentUser.lname !== 'string' || $scope.currentUser.lname == "") {
               notify.warning("Enter your last name.");
               return;
           }
            if(typeof $scope.currentUser.username !== 'string' || $scope.currentUser.username == "") {
               notify.warning("Enter a username.");
               return;
           }
            if(typeof $scope.currentUser.phone !== 'number' || $scope.currentUser.phone.toString().length !== 9) {
               notify.warning("Invalid phone number!");
               return;
           }
           if(typeof $scope.old_password === "string"
               && typeof $scope.new_password === "string"
               && $scope.old_password !== "" && $scope.new_password !== "")
           {
               if($scope.old_password !== $scope.currentUser.password) {
                   notify.warning("The password does not match your current password!");
                   return;
               }
           }else{
               $scope.new_password = $scope.currentUser.password;
           }

           //saving
           $scope.db.transaction('rw',$scope.db.users,()=>{
               console.log($scope.currentUser);
               $scope.currentUser.password = $scope.new_password;
               $scope.db.users.put($scope.currentUser)
                   .then(()=>{
                       $scope.db.users.get($scope.currentUser.userID,(user)=>{
                           $scope.currentUser = user;
                           localStorage.setItem("user",JSON.stringify(user));
                           $scope.$apply();
                       });
                   })
           }).then(()=>{
               $scope.new_password = "";
               $scope.editUserBtn = false;
               $scope.$apply();
           }).catch((err)=>{
               console.error(err);
               notify.error("Unable save your data!");
           })
       };
   })
})