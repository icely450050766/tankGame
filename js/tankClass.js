/**
 * Created by Administrator on 2016/9/14.
 */

// 自定义插件： 坦克类（ 红色：敌人；绿色：玩家 ）
;(function($){

    // 构造函数（参数：是否是红色坦克、坦克的位置（真实位置））
    var tankClass = function( isRed, posX, posY ){

        this.type_isRed = isRed;// 坦克的 类型（是否是红色）

        this.run = { count: 0, direction: 'top', speed : 25 };// 运动次数（每次500ms）、运动方向、运动步长
        this.blood = 100;// 血量

        this.$tank = this.createTank( this.type_isRed, posX, posY );// 坦克的 jq对象
        //this.tankRun();// 要加入到html中 才能调用，否则不能获取承载坦克 的容器的大小

        //console.log( tankClass.prototype.mapArr );
        //this.$tank.bind('tankDie', function(){});
        //this.$tank.trigger('click');
    };

    // 所有对象共用属性，存放地图 状态 二维数组
    tankClass.prototype.mapArr = null;
    tankClass.prototype.cellSize = null;

    // 生成一个坦克，返回jq对象
    tankClass.prototype.createTank = function( isRed, posX, posY ){

        var _color = isRed ? 'red' : 'green';

        var $_str = $( '<div class="tank tank-' + _color + '">' +
            '<div class="rect"></div>' +
            '<div class="square">' +
            '<div class="circle"></div>' +
            '</div>' +
            '<div class="launch">' +
            '<div class="launch-spot"></div>' +
            '</div>' +
            '<div class="rect"></div>' +
            '</div>' );

        $_str.css( 'top', posY + 'px' );
        $_str.css( 'left', posX + 'px' );
        return $_str;
    };

    // 坦克运动
    tankClass.prototype.tankRun = function(){

        // 红色坦克（敌人）
        if( this.type_isRed ){

            this.run.count = parseInt( Math.random() * 10 );// 设置运动次数（Math.random()：返回[0,1））
            //console.log( this.run.count);

            // 设置运动方向
            var _dir = Math.random();
            if( _dir >= 0  &&  _dir < 0.25 ){ goTop.call( this ); }
            else if( _dir >= 0.25  &&  _dir < 0.5 ){ goBottom.call( this ); }
            else if( _dir >= 0.5  &&  _dir < 0.75 ){ goLeft.call( this ); }
            else if( _dir >= 0.75  &&  _dir < 1 ){ goRight.call( this ); }
            //console.log( this.run.direction);

            // 一次运动：
            var temp = setInterval( function() {

                if( this.run.count <= 0 ){ // 剩余运动次数 为0
                    clearInterval( temp );
                    this.tankRun();// 不断调用运动函数tankRun()，重复运动
                }

                this.run.count--; // 运动次数 减 1
                //console.log( this.run.count);

                // 根据运动方向，实现运动动画（参数：每一步的大小（步长））
                //takeOneStep.call( this, this.run.speed );

            }.bind(this), 100);


        }else{ // 绿色坦克（玩家）

            // 添加键盘 按键事件（只执行一次事件监听，不用重复调用 tankRun()函数）
            document.addEventListener('keydown',function(e){

                //console.log( this );
                //console.log(e.keyCode);

                switch (e.keyCode) {
                    case 38:{ // ↑
                        goTop.call(this);
                        takeOneStep.call(this, this.run.speed);
                        break;
                    }
                    case 40:{ // ↓
                        goBottom.call(this);
                        takeOneStep.call(this, this.run.speed);
                        break;
                    }
                    case 37:{ // ←
                        goLeft.call(this);
                        takeOneStep.call(this, this.run.speed);
                        break;
                    }
                    case 39:{ // →
                        goRight.call(this);
                        takeOneStep.call(this, this.run.speed);
                        break;
                    }
                    default:  break;// 其他键不响应
                }

            }.bind( this ));
        }

        // （辅助函数）设置方向（this 是 tankClass对象）
        function goTop(){
            this.run.direction = 'top';// 设置方向
            this.$tank[0].style.transform = 'rotate(0deg)';// 不旋转
        }
        function goBottom(){
            this.run.direction = 'bottom';
            this.$tank[0].style.transform = 'rotate(180deg)';// 旋转180度
        }
        function goLeft(){
            this.run.direction = 'left';
            this.$tank[0].style.transform = 'rotate(-90deg)';// 旋转-90度
        }
        function goRight(){
            this.run.direction = 'right';
            this.$tank[0].style.transform = 'rotate(90deg)';// 旋转90度
        }

        // （辅助函数）是否可通过（this 是 tankClass对象）参数是真实的坐标值（左上角）
        function isCanPass( positionX, positionY ){

            // 求坦克当前位置对应 mapArr[]的下标
            positionX /= this.cellSize;
            positionY /= this.cellSize;

            // 左上、左下、右上、右下 在地图数组 都是0，则改点可通过
            var _leftTop = { x: positionX, y: positionY };
            var _rightTop = { x: positionX + 1, y: positionY };
            var _leftBottom = { x: positionX, y: positionY + 1 };
            var _rightBottom = { x: positionX + 1, y: positionY + 1 };

            // y坐标 是第一维数组下标，x坐标 是第二维数组下标
            if( !this.mapArr[_leftTop.y][_leftTop.x]  &&  !this.mapArr[_rightTop.y][_rightTop.x]  &&
                !this.mapArr[_leftBottom.y][_leftBottom.x]  &&  !this.mapArr[_rightBottom.y][_rightBottom.x] ){
                return true;
            }else{
                return false;
            }
        }

        // （辅助函数）走一步（this 是 tankClass对象）
        function takeOneStep( speed ){

            var _container = this.$tank.parents('.container');// 承载坦克的容器（必须要等坦克加到.container后）

            switch( this.run.direction ){
                case 'top':{
                    if( this.$tank.position().top - speed >= 0 ){ // 不允许超出 .container 的边界

                        if( isCanPass.call( this, this.$tank.position().left, this.$tank.position().top - speed ) ){ // 且 新位置 可通过（为0）
                            this.$tank.css( 'top', '-=' + speed + 'px' );
                        }
                    }
                    break;
                }
                case 'bottom':{
                    if( this.$tank.position().top + speed <= _container.height() - this.$tank.height() ) { // 不允许超出 .container 的边界
                        if( isCanPass.call( this, this.$tank.position().left, this.$tank.position().top + speed ) ) { // 且 新位置 可通过（为0）
                            this.$tank.css('top', '+=' + speed + 'px');
                        }
                    }
                    break;
                }
                case 'left':{
                    if( this.$tank.position().left - speed >= 0 ) { // 不允许超出 .container 的边界
                        if( isCanPass.call( this, this.$tank.position().left - speed, this.$tank.position().top ) ) { // 且 新位置 可通过（为0）
                            this.$tank.css('left', '-=' + speed + 'px');
                        }
                    }
                    break;
                }
                case 'right':{
                    if( this.$tank.position().left + speed <= _container.width() - this.$tank.width() ) { // 不允许超出 .container 的边界）
                        if( isCanPass.call( this, this.$tank.position().left + speed, this.$tank.position().top ) ) { // 且 新位置 可通过（为0）
                            this.$tank.css('left', '+=' + speed + 'px');
                        }
                    }
                    break;
                }
            }
        }

    };

    // 坦克射击
    tankClass.prototype.tankShoot = function(){

        var _container = this.$tank.parents('.container');

        // 红色坦克
        if( this.type_isRed ){

            var temp = setInterval( function(){

                var _isShoot = Math.random();// 是否射击 [0,1)
                if( _isShoot < 0.05 ){
                    createBulletAndShoot.call( this ); // 创建 并发射 子弹
                }
            }.bind( this ), 100);

        }else{ // 绿色坦克

            document.addEventListener('keydown',function(e){
                //console.log(e.keyCode);
                if( e.keyCode == 32 ){
                    createBulletAndShoot.call( this ); // 创建 并发射 子弹
                }
            }.bind( this ));
        }

        //（辅助函数）创建 并发射 子弹 （this 是坦克类对象）
        function createBulletAndShoot(){

            // 创建一颗子弹
            var _top = this.$tank.find('.launch-spot').offset().top - _container.offset().top;
            var _left = this.$tank.find('.launch-spot').offset().left - _container.offset().left;
            var _bullet = new $.bulletClass( _left, _top );
            _container.append( _bullet.$bullet );

            // 子弹发射
            _bullet.bulletShoot( this.run.direction, function(){ // 回调函数
                tankClass.prototype.mapArr = $.bulletClass.prototype.mapArr;// 更新地图
                _bullet.$bullet.remove();// 移除对象
                _bullet = null;// 释放内存
            }.bind( this ));
        }

    };

    // 坦克被攻击
    tankClass.prototype.beShot = function(){
        this.blood -= 10;
        if( this.blood <= 0 ){
            this.$tank.remove();
            ///////////////////////////////////
        }
    };

    $.tankClass = tankClass;// 添加到 jQuery

})(jQuery);
