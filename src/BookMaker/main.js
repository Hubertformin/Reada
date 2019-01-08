const $ = require("jquery");
const ipc = require('electron').ipcRenderer;
const tinyMce = require("tinymce");
const fs = require('fs');
const Cryptr = require('cryptr');
const libCryptr = new Cryptr('LibraryKey');
const { Notify }  = require('../js/modules/Notifications');
const notify = new Notify();


var currentBook = {
    author:'',
    contents:[
        {title:'Untitled1',content:''}
    ],
    currentSection:0,
    description:'',
    category:'',
    id:'',
    title:'',
};

var app = angular.module("Editor",[]);
app.controller("mainCtr",($scope)=>{
    //loader
    $('body').waitMe({
        effect : 'rotateplane',
        text : 'Loading Editor...',
        bg : 'rgba(255,255,255,1)',
        color : '#004d40',
        waitTime : -1,
        textPos : 'vertical',
        fontSize : '25px',
    });
    angular.element(document).ready(()=>{
        ipc.on('data', (event, message) => {
            $scope.bookData = JSON.parse(message);
            currentBook.title = $scope.bookData.title;
            currentBook.id = $scope.bookData.bookID;
            $scope.$apply();
            //read contents of file
            $scope.currentBook = [];
            fs.readFile(`bin/publications/pub-${$scope.bookData.bookID}.rby`,(err,file)=>{
                if(err){
                    console.error(err);
                    notify.error("Book data corrupt!");
                    return;
                }
                let data = JSON.parse(libCryptr.decrypt(file));
                currentBook = data;
                $scope.currentBook = data;
                $scope.$apply();
                $('body').waitMe("hide");
                //going to last tab
                const newNodes = document.querySelectorAll('.chap_list');
                newNodes[currentBook.currentSection].click();
            })
        });
        //initialize editor
        tinyMce.init({
            selector:'#editor',
            theme: 'modern',
            plugins: [
                'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
                'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
                'save table contextmenu directionality emoticons template paste textcolor'
            ],
            menubar:"edit view insert format tools table",
           init_instance_callback: (editor) =>{
               editor.on('keyUp',(e)=>{
                   //console.log("Efiked",e)
                   $scope.save();
               })
           },
            toolbar: 'styleselect | bold italic underline fontselect fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview fullpage | forecolor backcolor emoticons',
            image_title:true,
            image_advtab:true,
            automatic_uploads: true,
            // URL of our upload handler (for more details check: https://www.tinymce.com/docs/configure/file-image-upload/#images_upload_url)
            // images_upload_url: 'postAcceptor.php',
            // here we add custom filepicker only to Image dialog
            file_picker_types: 'image',
            // and here's our custom image picker
            file_picker_callback: function(cb, value, meta) {
                var input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');

                // Note: In modern browsers input[type="file"] is functional without
                // even adding it to the DOM, but that might not be the case in some older
                // or quirky browsers like IE, so you might want to add it to the DOM
                // just in case, and visually hide it. And do not forget do remove it
                // once you do not need it anymore.

                input.onchange = function() {
                    var file = this.files[0];

                    var reader = new FileReader();
                    reader.onload = function () {
                        // Note: Now we need to register the blob in TinyMCEs image blob
                        // registry. In the next release this part hopefully won't be
                        // necessary, as we are looking to handle it internally.
                        var id = 'blobid' + (new Date()).getTime();
                        var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
                        var base64 = reader.result.split(',')[1];
                        var blobInfo = blobCache.create(id, file, base64);
                        blobCache.add(blobInfo);

                        // call the callback and populate the Title field with the file name
                        cb(blobInfo.blobUri(), { title: file.name });
                    };
                    reader.readAsDataURL(file);
                };

                input.click();
            },
        });
        //console.log(tinyMce.activeEditor.getContent());
        //Save file
        $scope.save = ()=>{
            let titles = $('.chap_list');
            currentBook.contents[currentBook.currentSection].title = $(titles[currentBook.currentSection]).children('.value').html();
            currentBook.contents[currentBook.currentSection].content = tinyMce.activeEditor.getContent();
            console.log(currentBook);
            //saving to book
            let bookData = libCryptr.encrypt(JSON.stringify(currentBook));
            fs.writeFile(`bin/publications/pub-${currentBook.id}.rby`,bookData,(err)=>{
                if(err) {
                    console.error(err)
                    notify.error("Unable to save!");
                }
            });
        };
        $scope.addSection = ()=>{
            const nodeLength = document.querySelectorAll('.chap_list').length;
            //currentBook.contents.push({title:`Untitled${nodeLength+1}`,content:''});
            $scope.currentBook.contents.push({title:`Untitled${nodeLength+1}`,content:''});
            const newNodes = document.querySelectorAll('.chap_list');
            newNodes[newNodes.length - 1].click();
            console.log(currentBook);
        };
        //switch section
        //events
        //document.querySelectorAll('.chap_list');
    });
});
//This functions are external because the work for elements that were later added
//to close chapter node list
function closeChapList(e){
    const parent = $(e.currentTarget).parents('.chap_list');
    currentBook.contents.splice(parent.index(),1);
    const newNodes = document.querySelectorAll('.chap_list');
    newNodes[parent.index() - 1].click();
    parent.remove();
}
function switchSection(e){
    const index = $(e.currentTarget).index();
    if(index === -1) return false;
    $('.chap_list').removeClass('active');
    $(e.currentTarget).addClass('active');
    //console.log(tinyMce.activeEditor.getContent());
    currentBook.currentSection = index;
    const data = currentBook.contents[index].content;
    tinyMce.activeEditor.setContent(data);
    //tinyMce.activeEditor.focus();

}