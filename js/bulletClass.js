/**
 * Created by Administrator on 2016/9/16 0016.
 */
// 自定义插件： 子弹类
;( function($){

    // 构造函数（参数：初始位置）
    var bulletClass = function( posX, posY, creater ){
        this.speed = 20;// 不能大于this.cellSize，否则会出现 砖头被间隔射击 的情况
        this.creater = creater;// 创建人（用于确定攻击对象，敌人之间不能互相残杀）
        this.$bullet = this.createBullet( posX, posY );
    };

    // 所有对象共用属性
    bulletClass.prototype.mapArr = null;// 指向地图数组 的指针
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

            // 当前 子弹 左上角位置
            var _left = this.$bullet.position().left;
            var _top = this.$bullet.position().top;

            switch( direction ) {
                case 'top':{
                    if ( _top - speed >= 0  &&  isCanPass.call( this, _left, _top - speed, direction ) ) { // 不允许超出 .container 的边界 且 新位置 可通过（为0）
                        this.$bullet.css('top', '-=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
                case 'bottom':{
                    if( _top + speed <= _container.height() - this.$bullet.height()  &&  isCanPass.call( this, _left, _top + speed, direction ) ) { // 不允许超出 .container 的边界 且 新位置 可通过（为0）
                        this.$bullet.css('top', '+=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
                case 'left':{
                    if( _left - speed >= 0  &&  isCanPass.call( this, _left - speed, _top, direction ) ) { // 不允许超出 .container 的边界 且 新位置 可通过（为0）
                        this.$bullet.css('left', '-=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
                case 'right':{
                    if( _left + speed <= _container.width() - this.$bullet.width()  &&  isCanPass.call( this, _left + speed, _top, direction ) ) { // 不允许超出 .container 的边界 且 新位置 可通过（为0）
                        this.$bullet.css('left', '+=' + speed + 'px');
                    }
                    else stopBulletShoot( temp, callbackFunc );// 子弹停止运动
                    break;
                }
            }

        }.bind( this ), 100 );

        // （辅助函数）是否可通过 （遇到障碍物/射到坦克/到容器边界，则不可通过）
        function isCanPass( positionX, positionY, direction ){

            // 子弹发射地方在两个障碍物之间的缝隙，因此默认先射击 向下取整 的障碍物，然后射击 向上取整 的障碍物。
            // 射击顺序类比 层次遍历 !! 左上方优先射击

            // 求子弹当前位置对应 mapArr[]的下标。先向下取整。（Math.floor()向下取整）
            var posX = Math.floor( positionX / this.cellSize );
            var posY = Math.floor( positionY / this.cellSize );

            // 向下取整
            if( !returnIsCanPass.call( this, posX, posY ) ){
               return false;

            }else{ // 向上取整

                if( direction == 'top'  ||  direction == 'bottom' ){// 垂直飞行

                    posX = Math.ceil( positionX / this.cellSize );// 横坐标 向上取整
                    return returnIsCanPass.call( this, posX, posY );

                }else if( direction == 'left'  ||  direction == 'right' ){// 水平飞行

                    posY = Math.ceil( positionY / this.cellSize );// 纵坐标 向上取整
                    return returnIsCanPass.call( this, posX, posY );
                }

            }

            // （辅助函数）传入一个位置，返回是否可通过（this是 子弹类对象）
            function returnIsCanPass( posX, posY ){

                //【墙】 向上/向下取整 碰到 墙 都不可通过
                if( this.mapArr[posY][posX] == 2 ) return false;

                if( this.mapArr[posY][posX] == 1 ){ //  有可击破的障碍物：【砖头】
                    shootBrick.call( this, posX, posY );
                    return false; // 不可通过

                }else if( this.mapArr[posY][posX] == -1 ){// 【钻石】
                    this.$bullet.trigger('gameOver');// 触发事件，游戏结束
                    return false; // 不可通过

                }else if( typeof this.mapArr[posY][posX] == "object" ){// 【坦克】
                    shootTank.call( this, posX, posY  );
                    return false; // 不可通过

                }
                else return true;
            }

        }

        // （辅助函数）击破砖头
        function shootBrick( posX, posY ){
            bulletClass.prototype.mapArr[posY][posX] = 0;// 击破，变成无障碍物
            // 修改对应的图片
            var colCount = this.mapArr[0].length;// 每行的图片数量
            _container.children('img').eq( posY * colCount + posX ).attr( 'src', 'img/blank.png');
        }

        // （辅助函数）射击坦克
        function shootTank( posX, posY ){

            var _tankThis = bulletClass.prototype.mapArr[posY][posX];// 获取坦克的 this指针

            if( this.creater.type_isRed ){// 子弹创建者是 红色坦克（敌人）
                if( _tankThis.type_isRed ) return;// 被攻击者 也是红色坦克，攻击无效
            }

            _tankThis.beShot();// 坦克 被攻击
        }

        // （辅助函数）碰到障碍物/边界，子弹停止运动（参数：setInterval的句柄、回调函数名）
        function stopBulletShoot( temp, callbackFunc ){
            clearInterval( temp );
            callbackFunc();// 执行回调函数
        }

    };

    // 添加到 jQuery
    $.bulletClass = bulletClass;

})( jQuery );
