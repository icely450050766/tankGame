/**
 * Created by Administrator on 2016/9/14.
 */

// 自定义插件： 坦克类（ 红色：敌人；绿色：玩家 ）
;(function($){

    // 构造函数（参数：是否是红色坦克、坦克的位置（真实位置））
    var tankClass = function( isRed, posX, posY ){

        this.type_isRed = isRed;// 坦克的 类型（是否是红色）
        this.blood = 100;// 血量

        this.size = { width: 2, height: 2 };// 坦克大小（ 占 地图数组的2个单元格 ）
        this.pos = { x: 0, y: 0 };// 当前位置
        this.run = { count: 0, direction: 'top', speed : tankClass.prototype.cellSize };// 运动次数（每次500ms）、运动方向、运动步长(rem)

        this.$tank = this.createTank( this.type_isRed, posX, posY );// 坦克的 jq对象
        //this.tankRun();// 要加入到html中 才能调用，否则不能获取承载坦克 的容器的大小

        //console.log( tankClass.prototype.mapArr );
    };

    // 所有对象共用属性
    tankClass.prototype.mapArr = null; // 指向地图数组 的指针
    tankClass.prototype.mapArrWidthLength = 0;
    tankClass.prototype.mapArrHeightLength = 0;

    tankClass.prototype.cellSize = null;
    tankClass.prototype.remToPx = 0;// 运动步长是rem为单位, 1rem -> ?px

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

        $_str.css({
            'width': this.cellSize * this.size.width + 'rem',
            'height': this.cellSize * this.size.height + 'rem',
            'top': posY * this.cellSize + 'rem',
            'left': posX * this.cellSize + 'rem'
        } );

        if( !this.type_isRed )  $('.remainBlood').css( 'height', this.blood + '%' );// 玩家 设置血量条

        // 设置 坦克当前 位置
        this.pos.x = posX;
        this.pos.y = posY;

        return $_str;
    };

    // 坦克运动
    tankClass.prototype.tankRun = function(){

        if( this.$tank == null ) return;// 坦克已死亡，返回

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

                if( this.$tank == null ) clearInterval( temp );// 坦克已死亡

                if( this.run.count <= 0 ){ // 剩余运动次数 为0
                    clearInterval( temp );
                    this.tankRun();// 不断调用运动函数tankRun()，重复运动
                }

                this.run.count--; // 运动次数 减 1
                //console.log( this.run.count);

                // 根据运动方向，实现运动动画（参数：每一步的大小（步长））
                takeOneStep.call( this, this.run.speed );

            }.bind(this), 150);


        }else{ // 绿色坦克（玩家）

            // 添加键盘 按键事件（只执行一次事件监听，不用重复调用 tankRun()函数）
            document.addEventListener('keydown',function(e){

                //console.log( this );
                //console.log(e.keyCode);

                if( this.$tank == null ) return;// 坦克已死亡

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

        // （辅助函数）是否可通过（this 是 tankClass对象）参数是 坦克左上角 在地图数组中的坐标
        function isCanPass( posX, posY ){

            if( this.$tank == null ) return false;// 坦克已死亡

            // 左上、左下、右上、右下 在地图数组 都是0，则改点可通过
            // y坐标 是第一维数组下标，x坐标 是第二维数组下标（ 如果无障碍物（0）或者 是自己，则可以前进 ）
            if( ( !this.mapArr[posY][posX]  ||  this.mapArr[posY][posX] == this )
                &&  ( !this.mapArr[posY+1][posX]  ||  this.mapArr[posY+1][posX] == this )
                &&  ( !this.mapArr[posY][posX+1]  ||  this.mapArr[posY][posX+1] == this )
                &&  ( !this.mapArr[posY+1][posX+1]  ||  this.mapArr[posY+1][posX+1] == this ) ){
                return true;
            }
            else  return false;
        }

        // （辅助函数）走一步（this 是 tankClass对象）
        function takeOneStep( speed ){

            if( this.$tank == null ) return;// 坦克已死亡

            var _container = this.$tank.parents('.container');// 承载坦克的容器（必须要等坦克加到.container后）

            //  当前 坦克左上角位置 对应数组 的下标
            var _posX = this.pos.x;
            var _posY = this.pos.y;

            // 走一步相对于数组来说，移动_oneStep
            var oneStep = speed / this.cellSize;

            switch( this.run.direction ){
                case 'top':{
                    if( _posY - oneStep >= 0  &&  isCanPass.call( this, _posX, _posY - oneStep) ){ // 不允许超出 .container 的边界 且 新位置 可通过（为0）

                        // 修改 移动后 地图的状态
                        tankClass.prototype.mapArr[_posY+1][_posX] = tankClass.prototype.mapArr[_posY+1][_posX+1] = 0;// 左下、右下
                        tankClass.prototype.mapArr[_posY-1][_posX] = tankClass.prototype.mapArr[_posY-1][_posX+1] = this; // top

                        this.$tank.css( 'top', '-=' + speed + 'rem' );
                        this.pos.y -= oneStep;
                    }
                    break;
                }
                case 'bottom':{
                    if( _posY + oneStep  <= this.mapArrHeightLength - this.size.height  &&  isCanPass.call( this, _posX, _posY + oneStep) ) { // 不允许超出 .container 的边界 且 新位置 可通过（为0）

                        // 修改 移动后 地图的状态
                        tankClass.prototype.mapArr[_posY][_posX] = tankClass.prototype.mapArr[_posY][_posX+1] = 0;// 左上、右上
                        tankClass.prototype.mapArr[_posY+2][_posX] = tankClass.prototype.mapArr[_posY+2][_posX+1] = this; // bottom

                        this.$tank.css('top', '+=' + speed + 'rem');
                        this.pos.y += oneStep;
                    }
                    break;
                }
                case 'left':{
                    if( _posX - oneStep >= 0  &&  isCanPass.call( this, _posX - oneStep, _posY ) ) { // 不允许超出 .container 的边界 且 新位置 可通过（为0）

                        // 修改 移动后 地图的状态
                        tankClass.prototype.mapArr[_posY][_posX+1] = tankClass.prototype.mapArr[_posY+1][_posX+1] = 0;// 右上、右下
                        tankClass.prototype.mapArr[_posY][_posX-1] = tankClass.prototype.mapArr[_posY+1][_posX-1] = this; // left

                        this.$tank.css('left', '-=' + speed + 'rem');
                        this.pos.x -= oneStep;
                    }
                    break;
                }
                case 'right':{
                    if( _posX + oneStep <= this.mapArrWidthLength - this.size.width &&  isCanPass.call( this, _posX + oneStep, _posY ) ) { // 不允许超出 .container 的边界 且 新位置 可通过（为0）

                        // 修改 移动后 地图的状态
                        tankClass.prototype.mapArr[_posY][_posX] = tankClass.prototype.mapArr[_posY+1][_posX] = 0;// 左上、左下
                        tankClass.prototype.mapArr[_posY][_posX+2] = tankClass.prototype.mapArr[_posY+1][_posX+2] = this; // right

                        this.$tank.css('left', '+=' + speed + 'rem');
                        this.pos.x += oneStep;
                    }
                    break;
                }
            }

            /*
            // 判断 地图数组中，数组元素是 this 的元素个数。永远输出4 就对了
            var count = 0;
            for( var i=0; i < tankClass.prototype.mapArr.length; i++ ){
                for( var j=0; j < tankClass.prototype.mapArr[i].length; j++ ) {
                    if (tankClass.prototype.mapArr[i][j] == this) {
                        count++;
                    }
                }
            }
            console.log( count );
            */

        }

    };

    // 坦克射击
    tankClass.prototype.tankShoot = function( num ){

        var _container = this.$tank.parents('.container');

        // 红色坦克
        if( this.type_isRed ){

            var temp = setInterval( function(){

                // 坦克死亡，被移除后，不能再发射子弹
                if( this.$tank == null ) clearInterval( temp );

                var _isShoot = Math.random();// 是否射击 [0,1)
                if( _isShoot < num ){
                    createBulletAndShoot.call( this ); // 创建 并发射 子弹
                }
            }.bind( this ), 100);

        }else{ // 绿色坦克

            document.addEventListener('keydown',function(e){
                //console.log(e.keyCode);

                if( this.$tank == null ) return;// 坦克已死亡

                if( e.keyCode == 32 ){
                    createBulletAndShoot.call( this ); // 创建 并发射 子弹
                }
            }.bind( this ));
        }

        //（辅助函数）创建 并发射 子弹 （this 是坦克类对象）
        function createBulletAndShoot(){

            if( this.$tank == null ) return;// 坦克死亡

            // 创建一颗子弹
            var _top = this.$tank.find('.launch-spot').offset().top - _container.offset().top;
            var _left = this.$tank.find('.launch-spot').offset().left - _container.offset().left;
            //console.log( _left );
            //console.log( _top );

            // 如果 坦克死亡后 还创建了子弹，这时候_top、_left为负数，不应该创建该子弹
            if( _top >= 0  &&  _left >= 0 ){

                var _bullet = new $.bulletClass( _left, _top, this );
                _container.append( _bullet.$bullet );

                // 子弹发射
                _bullet.bulletShoot( this.run.direction, function(){ // 回调函数

                    //tankClass.prototype.mapArr = $.bulletClass.prototype.mapArr;// 不用更新地图，因为 数组是引用对象

                    _bullet.$bullet.remove();// 移除对象
                    _bullet = null;// 释放内存

                }.bind( this ));
            }

        }

    };

    // 坦克被攻击
    tankClass.prototype.beShot = function(){

        this.blood -= 10;// 血量减少

        // 被射中的是玩家，修改血量条
        if( !this.type_isRed ){
            $('.remainBlood').css( 'height', this.blood + '%' );
        }

        // 血量<0
        if( this.blood < 0 ){

            // 坦克死亡，不再占用位置，因此要 修改 mapArr地图数组
            var _posX = this.pos.x;
            var _posY = this.pos.y;
            tankClass.prototype.mapArr[_posY][_posX] = tankClass.prototype.mapArr[_posY][_posX+1] = 0;
            tankClass.prototype.mapArr[_posY+1][_posX] = tankClass.prototype.mapArr[_posY+1][_posX+1] = 0;

            if( this.type_isRed ){
                this.$tank.trigger('tankDie');// 触发事件，告诉.container有一个坦克死亡
            }else{
                this.$tank.trigger('gameOver');// 触发事件，游戏结束
            }

            this.$tank.remove(); // 移除 html元素
            this.$tank = null;// 清空缓存（同时 坦克不能继续发射子弹）
        }
    };

    // 添加到 jQuery
    $.tankClass = tankClass;

})(jQuery);
