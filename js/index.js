/**
 * Created by Administrator on 2016/9/14.
 */

//  总宽度650px(26个单位)，坦克宽度约等于50px（2个单位），小于50px使得更容易运动

var index = (function(){
    return{

        // 初始化 坦克类、子弹类 的数据
        mapArr : [],// 存放地图 状态 二维数组( 0无障碍物，1砖头（可击破），2墙（不可击破），3河水（子弹可通过）) 坦克类、子弹类都有指针指向该数组，实现地图共享
        cellSize : 25, // 地图每个单元格的边长(25px)

        // 坦克（只用于初始化，数据不会随着 当轮游戏状态 而变化）
        redTankNum : 4,// 红色坦克数量
        tankArr : [],// 坦克数组，记录每个坦克的 new时返回的 this 指针（前面 redTankNum个 是红色坦克；最后一个是 绿色坦克）
        tankPosArr : [{ x:100, y:50 }, { x: 250, y: 325 }, { x: 600, y: 0 }, { x: 550, y: 550 }, { x:225, y: 600 }],// 初始化 坦克位置 数组（前面 redTankNum个 是红色坦克；最后一个是 绿色坦克）

        // 红色坦克死亡数（判断玩家是否赢了）
        redTankDieNum : 0,

        // 难度
        level : 0,// 等级
        shootProbability : 0,// 红色坦克的 子弹射击概率

        // 初始化
        init: function(){
            this.upLevelBtnAddClickEvent();// “升级”按钮 添加点击事件
            $('#upLevelBtn').trigger('click');// 模拟点击事件 作为初始化
        },

        // 创建 地图 （26*26 个单位）（this 是 tankClass对象）
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

        // 根据当前坦克的位置，更新 地图 mapArr[]
        updateMapArr_byTankPosArr : function(){

            // 遍历 所有坦克 的位置数组
            for( var i=0; i < this.tankPosArr.length; i++ ){

                var posX = this.tankPosArr[i].x / this.cellSize;
                var posY = this.tankPosArr[i].y / this.cellSize;

                //console.log( this.tankArr[i] )

                // 改为存放 当前停放坦克的 this指针
                this.mapArr[posY][posX] = this.tankArr[i];// 左上
                this.mapArr[posY][posX+1] = this.tankArr[i];// 右上
                this.mapArr[posY+1][posX] = this.tankArr[i];// 左下
                this.mapArr[posY+1][posX+1] = this.tankArr[i];// 右下
            }

            //console.log( this.mapArr );
        },

        // 创建 坦克（this 是 tankClass对象）
        createTank : function(){

            for( var i=0; i <= this.redTankNum; i++ ){

                var _isRedTank =  i < this.redTankNum ? true : false;// （前面 redTankNum个 是红色坦克；最后一个是 绿色坦克）

                var t = new $.tankClass( _isRedTank, this.tankPosArr[i].x, this.tankPosArr[i].y, 25 );
                $('.container').append( t.$tank );

                t.tankRun();// 坦克运动
                t.tankShoot( this.shootProbability );// 坦克射击( 射击概率(0,1] )

                this.tankArr.push( t );// 加入到 红色坦克数组
            }
            //console.log( this.tankArr )
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
                    if( confirm('闯关成功！是否进入下一关？') ){
                        //location.reload();
                        $('#upLevelBtn').trigger('click');// 模拟点击事件 作为初始化
                    }
                }
            }.bind( this ));

            // 监听 游戏结束 事件
            $('.container').on('gameOver', '.tank', function(){
                //console.log('gameOver');
                if( confirm('闯关失败，游戏结束！是否重来一次？') ){
                    //location.reload();
                    this.level --;
                    $('#upLevelBtn').trigger('click');// 模拟点击事件 作为初始化
                }
            }.bind( this ));
        },


        // “升级”按钮 添加点击事件（this 是 tankClass对象）
        upLevelBtnAddClickEvent : function(){

            $(document).on('click', '#upLevelBtn', function(){ // 点击 升级按钮

                // 清空数据
                $('.tankGame-container .container').empty().off();// 清空容器内容、清空所有监听事件
                this.mapArr = [];// 存放地图
                this.tankArr = [];// 坦克数组 （this 指针）
                this.redTankDieNum = 0;// 红色坦克死亡数

                // 初始化数据
                this.tankEventListener();// 监听 坦克死亡事件，反馈玩家 赢/输（this 是 tankClass对象）

                this.createMap();// 创建地图（场景）
                this.initBulletAndTankClassPrototype(); // 初始化 子弹类、坦克类 的prototype（公共属性值）

                this.createTank();// 创建 坦克，加入到视图中，同时 初始化 坦克数组tankArr[]（保存坦克 this指针）
                this.updateMapArr_byTankPosArr();// 根据当前坦克的位置，更新 地图 mapArr[]。要用到tankArr[]，因为更新的数据为 坦克的this

                this.levelUp();// 等级上升
                this.updateMapArr_byTankPosArr();// 更新 地图 mapArr[]

                $('#upLevelBtn').trigger('blur');// 升级按钮 失去焦点

            }.bind( this ));
        },

        // 等级上升（this 是 tankClass对象）
        levelUp : function(){

            this.level ++;// 等级上升

            if( this.level <= 5 ){ // 5级以内，增加 红色坦克 射出子弹的概率
                this.shootProbability += 0.05;

            }else{// 大于5级，增加红色坦克数量
                this.redTankNum ++;

                // 随机生成一个位置, 判断该位置是否可放置（左上、左下、右上、右下都要为0，而且没有其他坦克，才能放下）
                var newTankPos = null;
                do {
                    newTankPos = {x: parseInt(Math.random()*25) * 25, y: parseInt(Math.random()*25) * 25};// [0,625) 且是 25的倍数
                    var _posX = newTankPos.x / this.cellSize;
                    var _posY = newTankPos.y / this.cellSize;

                } while (this.mapArr[_posY][_posX] || this.mapArr[_posY+1][_posX] || this.mapArr[_posY][_posX+1] || this.mapArr[_posY+1][_posX+1]
                || typeof this.mapArr[_posY][_posX] == "object"  ||  typeof this.mapArr[_posY+1][_posX] == "object"
                || typeof this.mapArr[_posY][_posX+1] == "object"  ||  typeof this.mapArr[_posY+1][_posX+1] == "object");

                //console.log( newTankPos );
                this.tankPosArr.unshift( newTankPos );// 加入到 坦克位置数组 前面

                // 插入 新坦克
                var t = new $.tankClass( true, this.tankPosArr[0].x, this.tankPosArr[0].y, 25 );
                $('.container').append( t.$tank );

                t.tankRun();// 坦克运动
                t.tankShoot( this.shootProbability );// 坦克射击( 射击概率(0,1] )

                this.tankArr.unshift( t );// 加入到 坦克数组 前面
            }

            $('.myLevel-num').text( this.level );// 设置当前等级

        },

    }
})();

var init = index.init.bind( index );