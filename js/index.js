/**
 * Created by Administrator on 2016/9/14.
 */

//  总宽度650px(26个单位)，坦克宽度约等于50px（2个单位），小于50px使得更容易运动

var index = (function(){
    return{

        // 初始化 坦克类、子弹类 的数据
        mapArr : [],// 存放地图 状态 二维数组( 0无障碍物，1砖头（可击破），2墙（不可击破），3河水（子弹可通过）) 坦克类、子弹类都有指针指向该数组，实现地图共享
        cellSize : 25, // 地图每个单元格的边长(25px)

        // 坦克
        redTankNum : 4,// 红色坦克数量
        tankArr : [],// 坦克数组，记录每个坦克的 new时返回的 this 指针（前面 redTankNum个 是红色坦克；最后一个是 绿色坦克）
        tankPosArr : [{ x:100, y:50 }, { x: 250, y: 325 }, { x: 600, y: 0 }, { x: 550, y: 550 }, { x:225, y: 600 }],// 初始化 坦克位置 数组（前面 redTankNum个 是红色坦克；最后一个是 绿色坦克）

        redTankDieNum : 0,// 红色坦克死亡数（判断玩家是否赢了）

        // 难度
        level : 1,
        shootProbability : 0.05,// 红色坦克的 子弹射击概率

        // 初始化
        init: function(){

            this.tankEventListener();// 监听 坦克死亡事件，反馈玩家 赢/输（this 是 tankClass对象）

            this.createMap();// 创建地图（场景）
            this.initBulletAndTankClassPrototype(); // 初始化 子弹类、坦克类 的prototype（公共属性值）

            this.createTank();// 创建 坦克，加入到视图中
            this.updateMapArr_byTankPosArr();// 根据当前坦克的位置，更新 地图 mapArr[]
        },

        // （辅助函数）创建 地图 （26*26 个单位）（this 是 tankClass对象）
        createMap: function(){

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

            this.mapArr = _mapArr;
            //console.log( this.mapArr );

            var _content = '';
            for( var i=0; i < 26; i++ ){
                for( var j=0; j < 26; j++ ){

                    if( !this.mapArr[i][j] ){ // 无障碍物
                        _content += '<img src="img/blank.png">';

                    }else{

                        if( this.mapArr[i][j] == 1 ){ // 砖头（可击破）
                            _content += '<img src="img/brick.png">';

                        }else if( this.mapArr[i][j] == 2 ){ // 墙（不可击破）
                            _content += '<img src="img/wall.png">';

                        }else if( this.mapArr[i][j] == 3 ){ // 河水（子弹可通过）
                            _content += '<img src="img/river.png">';
                        }
                    }
                }
            }

            $('.container').append( _content ); // 插入

            // 限制图片 宽和高
            $('.container').children('img').css({
                'width' : this.cellSize + 'px',
                'height' : this.cellSize + 'px'
            });

        },

        // （辅助函数）根据当前坦克的位置，更新 地图 mapArr[]
        updateMapArr_byTankPosArr : function(){

            // 遍历 所有坦克 的位置数组
            for( var i=0; i < this.tankPosArr.length; i++ ){

                var posX = this.tankPosArr[i].x / this.cellSize;
                var posY = this.tankPosArr[i].y / this.cellSize;

                // 改为存放 当前停放坦克的 this指针
                this.mapArr[posY][posX] = this.tankArr[i];// 左上
                this.mapArr[posY][posX+1] = this.tankArr[i];// 右上
                this.mapArr[posY+1][posX] = this.tankArr[i];// 左下
                this.mapArr[posY+1][posX+1] = this.tankArr[i];// 右下
            }

            //console.log( this.mapArr );
        },

        // （辅助函数）创建 坦克（this 是 tankClass对象）
        createTank : function(){

            for( var i=0; i <= this.redTankNum; i++ ){

                var _isRedTank =  i < this.redTankNum ? true : false;// （前面 redTankNum个 是红色坦克；最后一个是 绿色坦克）

                var t = new $.tankClass( _isRedTank, this.tankPosArr[i].x, this.tankPosArr[i].y, 25 );
                $('.container').append( t.$tank );

                t.tankRun();// 坦克运动
                t.tankShoot( this.shootProbability );// 坦克射击( 射击概率(0,1] )

                this.tankArr.push( t );// 加入到 红色坦克数组
            }
        },

        // 初始化 子弹类、坦克类 的prototype（公共属性值）
        initBulletAndTankClassPrototype : function(){

            // 坦克类、子弹类的 marArr指针 指向地图二维数组
            $.bulletClass.prototype.mapArr = this.mapArr;// 初始化 子弹类 地图二维数组 指针（该属性所有 坦克类对象 共用）
            $.tankClass.prototype.mapArr = this.mapArr;// 初始化 坦克类 地图二维数组 指针（该属性所有 坦克类对象 共用）

            // 地图每个单元格的边长(25px)
            $.bulletClass.prototype.cellSize = this.cellSize;
            $.tankClass.prototype.cellSize = this.cellSize;
        },

        // 监听 坦克死亡事件，反馈玩家 赢/输（this 是 tankClass对象）
        tankEventListener : function(){

            // 监听 坦克死亡 事件
            $('.container').on('tankDie', '.tank', function(){
                //console.log('tankDie');
                this.redTankDieNum ++;
                console.log( this.redTankDieNum );

                if( this.redTankDieNum == this.redTankNum ){
                    if( confirm('恭喜你赢了，是否重新开始？') ){
                        location.reload();
                    }
                }
            }.bind( this ));

            // 监听 游戏结束 事件
            $('.container').on('gameOver', '.tank', function(){
                //console.log('gameOver');
                if( confirm('游戏结束，是否重新开始？') ){
                    location.reload();
                }
            });
        },
    }
})();

var init = index.init.bind( index );