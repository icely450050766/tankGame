/**
 * Created by Administrator on 2016/9/14.
 */

// 自定义插件： 坦克类（ 红色：敌人；绿色：玩家 ）
;(function($){

    // 构造函数（参数：是否是红色坦克、坦克的位置（真实位置）、地图每个单元格的边长(25px)）
    var tankClass = function( isRed, posX, posY, cellSize ){

        this.type_isRed = isRed;// 坦克的 类型（是否是红色）
        this.blood = 100;// 血量
        this.cellSize = cellSize;// 正方形单元格的长度(25px)

        this.run = { count: 0, direction: 0 };// 运动次数（每次500ms）、运动方向

        this.$tank = this.createTank( this.type_isRed, posX, posY );// 坦克的 jq对象
        //this.tankRun();

    };

    // 所有对象共用属性，存放地图 状态 二维数组
    tankClass.prototype.mapArr = null;

    // 初始化 存放地图 状态 二维数组( 0无障碍物，1砖头（可击破），2墙（不可击破），3河水（子弹可通过）)
    tankClass.prototype.initMapArr = function(){

        var _mapArr = [];

        _mapArr[0]  =  [0,0,0,0,0,0,2,2,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0];
        _mapArr[1]  =  [0,0,0,0,0,0,2,2,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,0,0,0];
        _mapArr[2]  =  [0,0,1,1,0,0,2,2,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0];
        _mapArr[3]  =  [0,0,1,1,0,0,2,2,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0];
        _mapArr[4]  =  [0,0,1,1,0,0,2,2,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0];
        _mapArr[5]  =  [0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,2,2,1,1,0,0];
        _mapArr[6]  =  [0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,2,2,1,1,0,0];
        _mapArr[7]  =  [0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,2,2,0,0,0,0,0,0];
        _mapArr[8]  =  [0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,2,2,0,0,0,0,0,0];
        _mapArr[9]  =  [0,0,0,0,0,0,1,1,0,0,0,0,2,2,0,0,0,0,1,1,0,0,1,1,2,2];
        _mapArr[10] =  [0,0,0,0,0,0,1,1,0,0,0,0,2,2,0,0,0,0,1,1,0,0,1,1,2,2];
        _mapArr[11] =  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,2,2,1,1,0,0,0,0,0,0];
        _mapArr[12] =  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,2,2,1,1,0,0,0,0,0,0];
        _mapArr[13] =  [0,0,1,1,0,0,1,1,1,1,0,0,0,0,2,2,1,1,1,1,0,0,1,1,0,0];
        _mapArr[14] =  [0,0,1,1,0,0,1,1,1,1,0,0,0,0,2,2,1,1,1,1,0,0,1,1,0,0];
        _mapArr[15] =  [0,0,0,0,0,0,2,2,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0];
        _mapArr[16] =  [0,0,0,0,0,0,2,2,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0];
        _mapArr[17] =  [0,0,1,1,3,3,2,2,0,0,1,1,0,0,1,1,0,0,3,3,3,3,1,1,3,3];
        _mapArr[18] =  [2,2,1,1,3,3,2,2,0,0,1,1,0,0,1,1,0,0,3,3,3,3,1,1,3,3];
        _mapArr[19] =  [2,2,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,3,3];
        _mapArr[20] =  [3,3,1,1,0,0,1,1,0,0,1,1,1,1,1,1,0,0,1,1,0,0,1,1,3,3];
        _mapArr[21] =  [3,3,1,1,0,0,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,3,3];
        _mapArr[22] =  [0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3];
        _mapArr[23] =  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3];
        _mapArr[24] =  [3,3,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,1,3,3];
        _mapArr[25] =  [3,3,1,1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,1,1,1,1,1,1,0,0];
        _mapArr[26] =  [3,3,1,1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,1,1,1,1,1,1,0,0];

        tankClass.prototype.mapArr = _mapArr;
        //console.log( tankClass.prototype.mapArr );
    };

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

        //  Math.random()：返回[0,1）

        this.run.count = parseInt( Math.random() * 20 );// 设置运动次数
        //console.log( this.run.count);

        // 设置运动方向
        var _dir = Math.random();
        if( _dir >= 0  &&  _dir < 0.25 ){
            this.run.direction = 'top';// 设置方向
            this.$tank[0].style.transform = 'rotate(0deg)';// 不旋转

        }else if( _dir >= 0.25  &&  _dir < 0.5 ){
            this.run.direction = 'bottom';
            this.$tank[0].style.transform = 'rotate(180deg)';// 旋转180度

        }else if( _dir >= 0.5  &&  _dir < 0.75 ){
            this.run.direction = 'left';
            this.$tank[0].style.transform = 'rotate(-90deg)';// 旋转-90度

        }else if( _dir >= 0.75  &&  _dir < 1 ){
            this.run.direction = 'right';
            this.$tank[0].style.transform = 'rotate(90deg)';// 旋转90度
        }
        //console.log( this.run.direction);


        // 一次运动：
        var _container = this.$tank.parents('.container');// 承载坦克的容器（必须要等坦克加到.container后）
        var temp = setInterval( function() {

            if( this.run.count <= 0 ){ // 剩余运动次数 为0
                clearInterval( temp );
                this.tankRun();// 不断重复 运动
            }

            this.run.count--; // 运动次数 减 1
            //console.log( this.run.count);


            var _speed = 25;// 每一步的大小
            // 根据运动方向，实现运动动画
            switch( this.run.direction ){
                case 'top':{
                    if( this.$tank.position().top - _speed >= 0 ){ // 不允许超出 .container 的边界

                        if( isCanPass.call( this, this.$tank.position().left, this.$tank.position().top - _speed ) ){ // 且 新位置 可通过（为0）
                            this.$tank.css( 'top', '-=' + _speed + 'px' );
                        }
                    }
                    break;
                }
                case 'bottom':{
                    if( this.$tank.position().top + _speed <= _container.height() - this.$tank.height() ) { // 不允许超出 .container 的边界
                        if( isCanPass.call( this, this.$tank.position().left, this.$tank.position().top + _speed ) ) { // 且 新位置 可通过（为0）
                            this.$tank.css('top', '+=' + _speed + 'px');
                        }
                    }
                    break;
                }
                case 'left':{
                    if( this.$tank.position().left - _speed >= 0 ) { // 不允许超出 .container 的边界
                        if( isCanPass.call( this, this.$tank.position().left - _speed, this.$tank.position().top ) ) { // 且 新位置 可通过（为0）
                            this.$tank.css('left', '-=' + _speed + 'px');
                        }
                    }
                    break;
                }
                case 'right':{
                    if( this.$tank.position().left + _speed <= _container.width() - this.$tank.width() ) { // 不允许超出 .container 的边界）
                        if( isCanPass.call( this, this.$tank.position().left + _speed, this.$tank.position().top ) ) { // 且 新位置 可通过（为0）
                            this.$tank.css('left', '+=' + _speed + 'px');
                        }
                    }
                    break;
                }
            }


            // 是否可通过（this 是 tankClass对象）参数是真实的坐标值（左上角）
            function isCanPass( positionX, positionY ){

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

        }.bind(this), 100);
    };



    $.tankClass = tankClass;// 添加到 jQuery

})(jQuery);
