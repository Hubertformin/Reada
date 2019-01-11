app.controller("recentCtr",($scope)=>{
        //variables
        $scope.recentBooks = [];
        $scope.editBooks = [];
        //fetching database
        $scope.db.transaction("rw",$scope.db.myBooks,()=>{
            $scope.db.myBooks.toArray()
                .then((data)=>{
                    data = data.filter(book=>{
                        return book.authorID === $scope.currentUser.userID;
                    });
                    $scope.myBooks = data;
                    $scope.recentBooks = data.filter((el)=>{
                        return typeof el.readTime === "number";
                    });
                    $scope.editBooks = data.filter((el)=>{
                        return typeof el.date === "number";
                    });
                })
        }).then(()=>{
            //$scope.$apply();
        }).catch((err)=>{
            console.error(err);
        })
});