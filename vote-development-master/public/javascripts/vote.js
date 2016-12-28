/**
 * Created by Administrator on 2016/12/25.
 */
var getData=(function () {
    var data=null;
    var url=window.location.href,
        indexReg=/index/,
        registerReg=/register/,
        detailReg=/detail/,
        searchReg = /search/,
        limit=10,
        offset=0,
        total=0,
        userInfo='userInfo',
        str='';
    function getUserInfo() {
        var user=getStorage(userInfo);
        if(user){
            $('.sign_in span').html('退出登录')
            $('.register').html('个人主页')
            $('.no_signed').hide()
            $('.username').html(user.name)
        }
        $('.sign_in').click(function (event) {
            $('.mask').show()
        })
        $('.mask').click(function (event) {
            if(event.target.className=='mask'){
                $(this).hide()
            }
        })
        $('.dropout').click(function (event) {
            deleteStorage(userInfo);
            window.location='/vote/index'
            console.log(url)
        })
        $('.subbtn').click(function (event) {
            var usernum=$('.usernum').val();
            var password=$('.user_password').val()
            if(usernum==''){
                alert('请输入你的ID号')
                return false
            }
            if(password==''){
                alert('请输入密码');
                return false;
            }
            var sendData={
                password:password,
                id:usernum
            }
            sendAjax('/vote/index/info','POST',sendData,function (result) {
                result=JSON.parse(result)
                setStorage(userInfo,{
                    name:result.user.username,
                    id:result.user.id
                })
                window.location=url
            })
        })
    }
    function  giveVote() {
        $(document).on('click','.btn',function (event) {
             var user=getStorage(userInfo)
            if(user){
                 var selfId=user.id;
                 var voterId=$(this).attr('data_id')
                sendAjax('/vote/index/poll?id='+voterId+'&voterId='+selfId+'','GET','',function (result) {
                    result=JSON.parse(result)
                    console.log(result)
                    if(result.errno==0){
                        var $span=$(event.target).siblings('.vote').children('span');
                         var spanHTML=parseInt($span[0].innerHTML)
                         $span.html(++spanHTML+'票')
                        $span.addClass('bounceIn')
                    }else {
                        alert(result.msg)
                    }
                })
            }else {
                $('.mask').show()
            }

        })
    }
    function searchHTML() {
        var val=/search\?(content)=(\d+)/g
        var numId=null
        url.replace(val,function () {
            numId=arguments[2]
            return numId
        })
        sendAjax('/vote/index/search?content='+numId+'','GET','',function (result) {
            result=JSON.parse(result)
            var str=''
            for (var i=0;i<result['data'].length;i++){
                var cur=result['data'][i];
                str+='<li>\
                  <div class="head">\
                      <a href="detail/'+cur['id']+'">\
                      <img src="'+cur['head_icon']+'" alt="">\
                      </a>\
                      </div>\
                      <div class="up">\
                      <div class="vote">\
                      <span>'+cur['vote']+'票</span>\
                  </div>\
                  <div class="btn" data_id="'+cur['id']+'">\
                      投TA一票\
                      </div>\
                      </div>\
                      <div class="descr">\
                      <a href="detail/'+cur['id']+'">\
                      <div>\
                      <span>'+cur['username']+'</span>\
                      <span>|</span>\
                      <span>'+cur['id']+'</span>\
                  </div>\
                  <p>'+cur['description']+'？</p>\
                  </a>\
                  </div>\
                  </li>'
            }
            $('.coming').html(str);
        })


    }
    function bindHtml() {
        for(var i=0;i<data.length;i++){
            str+=' <li>\
                  <div class="head">\
                      <a href="detail/'+data[i]['id']+'">\
                      <img src="'+data[i]['head_icon']+'" alt="">\
                      </a>\
                      </div>\
                      <div class="up">\
                      <div class="vote">\
                      <span>'+data[i]['vote']+'票</span>\
                  </div>\
                  <div class="btn" data_id="'+data[i]['id']+'">\
                      投TA一票\
                      </div>\
                      </div>\
                      <div class="descr">\
                      <a href="detail/'+data[i]['id']+'">\
                      <div>\
                      <span>'+data[i]['username']+'</span>\
                      <span>|</span>\
                      <span>'+data[i]['id']+'</span>\
                  </div>\
                  <p>'+data[i]['description']+'？</p>\
                  </a>\
                  </div>\
                  </li>'
        }
        $('.coming').html(str);
        $('#search').click(function () {
            var val=$('#search').siblings()[0].value;
            window.location = '/vote/search?content=' + val

        })
    }
    function touchMove() {
        window.onscroll=function () {
            var winHeight=document.documentElement.clientHeight||document.body.clientHeight;
            var scrollTop=document.documentElement.scrollTop||document.body.scrollTop;
            var realHeight=document.documentElement.scrollHeight||document.body.scrollHeight;
            var changeHeight=winHeight+scrollTop;
            if(changeHeight>=realHeight){
                offset=limit+offset;
                if(offset<total){
                    sendAjax('/vote/index/data?limit='+limit+'&offset='+offset+'','GET','',function (result) {
                        result=JSON.parse(result)
                        data=result;
                        total=data.data.total;
                        data=data['data']['objects'];
                        bindHtml()
                    });
                }else {
                    $('.box').html('内容已加载完')
                }
            }
        }
    }
    function detailPerson(obj){
        var str='<div class="pl">\
            <div class="head">\
            <img src="'+obj['head_icon']+'" alt="">\
            </div>\
            <div class="p_descr">\
            <p>'+obj['username']+'</p>\
            <p>'+obj['id']+'</p>\
        </div>\
        </div>\
        <div class="pr">\
            <div class="p_descr pr_descr">\
            <p>'+obj['rank']+'名</p>\
        <p>'+obj['vote']+'票</p>\
        </div>\
        </div>\
        <div class="motto">\
           '+obj['description']+'\
    </div>\
        </div>';
        return str;
    }
    function detailVoter(objs) {
        var str=''
        for(var i=0;i<objs.length;i++){
            str+='<li>\
                <div class="head">\
                <a href="#"><img src="'+objs[i]['head_icon']+'" alt=""></a>\
                </div>\
                <div class="up">\
                <div class="vote">\
                <span>投了一票</span>\
                </div>\
                </div>\
                <div class="descr">\
                <h3>'+objs[i]['username']+'</h3>\
                <p>'+objs[i]['id']+'</p>\
            </div>\
            </li>	'
        }
        return str
    }
    function detailInit() {
        var id= /detail\/(\d*)/.exec(url)[1]
        sendAjax('/vote/all/detail/data?id='+id,'GET','',function (result) {
            result=JSON.parse(result)
            $('.personal').html(detailPerson(result.data))
            $('.vflist').html(detailVoter(result.data.vfriend))
        })
    }
    function btnClick() {
        $('.rebtn').click(function (event) {
            var sendData=getValue()
                     sendAjax('/vote/register/data','POST',sendData,function (result) {
                         result=JSON.parse(result)
                         console.log(result)
                         if(result.errno==0){
                             console.log(sendData.username)
                             getStorage(userInfo,{
                                 id:data.id,
                                 name:sendData.username
                             })
                              window.location='/vote/index'
                         }else {
                             alert(result.msg)
                         }
                     })
        })
    }
    function setStorage(key,obj) {
        localStorage.setItem(key,JSON.stringify(obj))
    };
    function getStorage(key) {
        return JSON.parse(localStorage.getItem(key))
    };
    function deleteStorage(key) {
        return localStorage.removeItem(key);
    }
    function getValue() {
        var username=$('.uname').val();
        var intailPassword=$('.initial_password').val();
        var confirmPassword=$('.confirm_password').val();
        var mobile=$('.mobile').val();
        var description=$('.description').val();
        var gender='boy'
        if(username==''){
            alert('请输入用户名')
            return false;
        }
        if(intailPassword==''){
            alert('请输入 密码')
            return false
        }
        if(intailPassword!=confirmPassword){
            alert('两次输入的密码不一致')
            return false
        }
        if(description==''){
            alert('请输入内容')
            return false;
        }
        console.log(mobile)
        if(!(/^\d{11}$/.test(mobile))){
            alert('手机号码格式不正确');
            return false;
        }
        $('input[type=radio]')[0].checked?gender='boy':gender='girl'
        return {
            username:username,
            description:description,
            gender:gender,
            password:intailPassword,
            mobile:mobile
        }
    }
    function sendAjax(url,method,data,fn) {
//              $.ajax({
//                  url:'/vote/index/data?limit='+limit+'&offset='+offset+'',
//                  type:'GET',
//                  success:function (result) {
//                      result=JSON.parse(result)
//                      data=result;
//                      total=data.data.total;
//                      data=data['data']['objects'];
//                      bindHtml()
//                  }
//              })
        $.ajax({
            url:url,
            type:method,
            data:data,
            success:fn
        })
    }
    function personalHomePage() {
        var user=getStorage(userInfo);
        if(user){
            $('.register').click(function () {
                var uId=user.id
                console.log(uId)
                sendAjax('/vote/all/detail/data?id='+uId,'GET','',function (result) {
                    result=JSON.parse(result)
                    console.log(result)
                    window.location='/vote/detail/'+uId
                })

            })
        }
    }
    function  init() {
        sendAjax('/vote/index/data?limit='+limit+'&offset='+offset+'','GET','',function (result) {
            result=JSON.parse(result)
            data=result;
            total=data.data.total;
            data=data['data']['objects'];
            bindHtml();

        });
        btnClick()
        $(document).ready(function ($) {
            if(detailReg.test(url)){
                detailInit()
                if(indexReg.test(url)){
                    window.location='/vote/index'
                }
            }else if(indexReg.test(url)){
                touchMove()
                getUserInfo()
                giveVote()
                personalHomePage()
            }else if(searchReg.test(url)){
                searchHTML()
                giveVote()
            }
        })


        // $('#search').click(function (event) {
        //     var content=$('.search input').val()
        //     window.location='/vote/search?content='+content
        // })

    }
    return {
        init:init
    }
})()
getData.init()