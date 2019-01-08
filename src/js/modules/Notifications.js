//notifications class
class Notify {
    error(msg,time = 4000){
        M.toast({html:`<i class="left material-icons red-text text-darken-3">cancel</i>${msg}`,displayLength:time});
    }
    success(msg,time = 4000){
        M.toast({html:`<i class="left material-icons green-text text-darken-3">check_circle</i>${msg}`,displayLength:time});
    }
    info(msg,time = 4000){
        M.toast({html:`<i class="left material-icons light-blue-text text-darken-3">error</i>${msg}`,displayLength:time});
    }
    warning(msg,time = 4000){
        M.toast({html:`<i class="left material-icons amber-text text-darken-3">warning</i>${msg}`,displayLength:time});
    }

}
//alert class
class Alert{
    constructor(element){
        this.el = jQuery(element);
        this.messages = [];
        this.icon = this.el.find('div.img');
        this.title = this.el.find('.title');
        this.msg = this.el.find('.message');
        this.btn = this.el.find('a.actionBtn');
        this.close = this.el.find('a.cancelBtn');
        this.close.on('click',()=>{
            this.el.removeClass('active');
        });
        console.log(this.el.find('.message'))
    }
    notify({type,title,msg,action,silent=false,time = 4000}){
        return new Promise((resolve,reject)=>{
            var logo;
        switch(type){
            case 'success':
            logo = '<i class="left material-icons medium green-text text-darken-3">check_circle</i>';
            break;
            case 'warning':
            logo = '<i class="left material-icons medium amber-text text-darken-3 medium">warning</i>'
            break;
            case 'error':
            logo = '<i class="left material-icons medium red-text text-darken-3">cancel</i>';
            break;
            case 'info':
            logo = '<i class="left material-icons medium light-blue-text text-darken-3">error</i>';
            break;
            default:
            logo = '<i class="left material-icons medium light-blue-text text-darken-3">error</i>';
            break;
        }
        this.icon.html(logo);
        this.msg.html(msg);
        this.title.html(title);
        this.btn.attr('href',action);
        this.messages.push({title,msg});
        //Notification
        resolve(this.messages);
        //showing
        this.el.addClass('active');
        //removing
        if(!silent){
            var delay = setTimeout(()=>{
                this.el.removeClass('active');
            },time);
        }
        })
        
    }
}

module.exports = {
    Notify,
    Alert
};