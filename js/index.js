/**
 * Created by Administrator on 2016/9/14.
 */

//  总宽度650px(26个单位)，坦克宽度约等于50px（2个单位），小于50px使得更容易运动

var index = (function(){
    return{

        // 初始化
        init: function(){

            var t = new $.tankClass( true, 0, 0, 25 );
            t.initMapArr();// 初始化 地图数组

            this.createMap.call( t );// 创建地图（场景）

            $('.container').append( t.$tank );
            t.tankRun();// 坦克运动

            //var t2 = new $.tankClass( false, 200, 200 );
            //$('.container').append( t2.$tank );
            //t2.tankRun();
        },

        // 创建 地图 （26*26 个单位）this 是 tankClass对象
        createMap: function(){

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

            $('.container').append( _content );

        },


    }
})();

var init = index.init.bind( index );
