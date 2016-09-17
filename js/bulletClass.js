/**
 * Created by Administrator on 2016/9/16 0016.
 */
// 自定义插件： 子弹类
;( function($){

    // 构造函数（参数：初始位置）
    var bulletClass = function( posX, posY ){
        this.speed = 20;
        this.$bullet = this.createBullet( posX, posY );
    };

    // 所有对象共用属性，存放地图 状态 二维数组
    bulletClass.prototype.mapArr = null;
    bulletClass.prototype.cellSize = null;

    // 创建一颗子弹，返回子弹的jq对象
    bulletClass.prototype.createBullet = function( posX, posY ){
        var $_str = $('<div class="bullet"></div>');
        $_str.css({
            'top': posY + 'px',
            'left': posX + 'px'
        });
        return $_str;
    };

    // 子弹发射(参数：运动方向，回调函数)
    bulletClass.prototype.bulletShoot = function( direction, callbackFunc ){
        //console.log( bulletClass.prototype.mapArr );

        var _container = this.$bullet.parents('.container');// 承载坦克的容器（必须要等坦克加到.container后）
        var speed = this.speed;// 步长

        // 不断运动
        var temp = setInterval( function(){

            switch( direction ) {
                case 'top':{
                    if (this.$bullet.position().top - speed >= 0 // 不允许超出 .container 的边界
                        &&  isCanPass.call(this, this.$bullet.position().left, this.$bullet.position().top - speed, direction )) { // 且 新位置 可通过（为0）
                        this.$bullet.css('top', '-=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
                case 'bottom':{
                    if( this.$bullet.position().top + speed <= _container.height() - this.$bullet.height() // 不允许超出 .container 的边界
                        &&  isCanPass.call( this, this.$bullet.position().left, this.$bullet.position().top + speed, direction ) ) { // 且 新位置 可通过（为0）
                        this.$bullet.css('top', '+=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
                case 'left':{
                    if( this.$bullet.position().left - speed >= 0 // 不允许超出 .container 的边界
                        &&  isCanPass.call( this, this.$bullet.position().left - speed, this.$bullet.position().top, direction ) ) { // 且 新位置 可通过（为0）
                        this.$bullet.css('left', '-=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
                case 'right':{
                    if( this.$bullet.position().left + speed <= _container.width() - this.$bullet.width() // 不允许超出 .container 的边界）
                        &&  isCanPass.call( this, this.$bullet.position().left + speed, this.$bullet.position().top, direction ) ) { // 且 新位置 可通过（为0）
                        this.$bullet.css('left', '+=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
            }

        }.bind( this ), 100 );

        // （辅助函数）是否可通过
        function isCanPass( positionX, positionY, direction ){

            // 子弹发射地方在两个障碍物之间的缝隙，因此默认先射击 向下取整 的障碍物，然后射击 向上取整 的障碍物。
            // 射击顺序类比 层次遍历 !! 左上方优先射击

            // 求子弹当前位置对应 mapArr[]的下标。先向下取整。（Math.floor()向下取整）
            var posX = Math.floor( positionX / this.cellSize );
            var posY = Math.floor( positionY / this.cellSize );

            // 向上/向下取整 碰到 墙 都不可通过
            if( this.mapArr[posY][posX] == 2 ) return false;
            if( direction == 'top'  ||  direction == 'bottom' ){// 垂直飞行
                _posX = Math.ceil( positionX / this.cellSize );// 横坐标 向上取整
                if( this.mapArr[posY][_posX] == 2 ) return false;

            }else if( direction == 'left'  ||  direction == 'right' ){// 水平飞行
                _posY = Math.ceil( positionY / this.cellSize );// 纵坐标 向上取整
                if( this.mapArr[_posY][posX] == 2 ) return false;
            }

            // 向下取整 有可击破的障碍物：砖头
            if( this.mapArr[posY][posX] == 1 ){
                shootBrick.call( this, posX, posY );
                return false; // 不可通过

            }else{ // 向上取整  无障碍物 或 河水（子弹可通过）

                if( direction == 'top'  ||  direction == 'bottom' ){// 垂直飞行

                    // 向上取整
                    posX = Math.ceil( positionX / this.cellSize );// 横坐标 向上取整
                    if( this.mapArr[posY][posX] == 1 ){ // 有可击破的障碍物：砖头
                        shootBrick.call( this, posX, posY );
                        return false; // 不可通过
                    }
                    else return true; // 向上、向下取整 都没有可击破的 障碍物（砖头） 可通过

                }else if( direction == 'left'  ||  direction == 'right' ){// 水平飞行

                    // 向上取整
                    posY = Math.ceil( positionY / this.cellSize );// 纵坐标 向上取整
                    if( this.mapArr[posY][posX] == 1 ){ // 有可击破的障碍物：砖头
                        shootBrick.call( this, posX, posY );
                        return false; // 不可通过
                    }
                    else return true; // 向上、向下取整 都没有可击破的 障碍物（砖头） 可通过
                }

            }
        }

        // （辅助函数）击破砖头
        function shootBrick( posX, posY ){
            bulletClass.prototype.mapArr[posY][posX] = 0;// 击破，变成无障碍物
            // 修改对应的图片
            var colCount = this.mapArr[0].length;// 每行的图片数量
            _container.children('img').eq( posY * colCount + posX ).attr( 'src', 'img/blank.png');
        }

        // （辅助函数）碰到障碍物/边界，子弹停止运动（参数：setInterval的句柄、回调函数名）
        function stopBulletShoot( temp, callbackFunc ){
            clearInterval( temp );
            callbackFunc();// 执行回调函数
        }

    };


    $.bulletClass = bulletClass;// 添加到 jQuery

})( jQuery );
