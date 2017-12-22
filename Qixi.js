var config = {
	keepZoomRatio:false,
	layer: {
		"width": "100%",
		"height": "100%",
		"top": 0,
		"left": 0
	},
	// 音乐配置
	audio: {
		enable: true,  // 是否开启音乐
        playURL: 'music/happy.wav', // 正常播放地址
        cycleURL: 'music/circulation.wav' // 正常循环播放地址
	},
	setTime: {
		walkToThird: 6000,
		walkToMiddle: 6500,
		walkToEnd: 6500,
		walkToBridge: 2000,
		bridgeWalk: 2000,
		walkToShop: 1500,
		walkOutShop: 1500,
		openDoorTime: 800,
		shutDoorTime: 500,
		waitRotate: 850,
		waitFlower: 800
	},
	snowflakeURL: [
        'images/snowflake/snowflake1.png',
        'images/snowflake/snowflake2.png',
        'images/snowflake/snowflake3.png',
        'images/snowflake/snowflake4.png',
        'images/snowflake/snowflake5.png',
        'images/snowflake/snowflake6.png'
    ]
}

var debug = 0;
if (debug) {
	$.each(config.setTime, function(key, val) {
    	config.setTime[key] = 500;
	});
}
if (config.keepZoomRatio) {
	var proportionY = 900 / 1440;
	var screenHeight = $(document).height();
	var zoomHeight = screenHeight * proportionY;
	var zoomTop = (screenHeight - zoomHeight) / 2;
	config.layer.height = zoomHeight;
	config.layer.top = zoomTop;
}

var instanceX;

var container = $("#content");
var swipe = Swipe(container);
var visualWidth = container.width();
var visualHeight = container.height();

// 获取数据
var getValue = function(className) {
    var $elem = $('' + className + '');
    // 走路的
    return {
        height: $elem.height(),
        top: $elem.position().top
    };
}

// 路的Y轴
var PathY = function() {
	var data = getValue('.a_background_middle');
	return data.top + data.height / 2;
}();

// 桥的Y轴
var bridgeY = function() {
    var data = getValue('.c_background_middle');
    return data.top;
}();

// 动画结束事件
var animationEnd = function() {
	var explorer = navigator.userAgent;
	if (~explorer.indexOf('webkit')) {
		return 'webkitAnimationEnd';
	}
	return 'animationend';
}();

if (config.audio.enable) {
	var audio1 = Html5Audio(config.audio.playURL);
    audio1.end(function() {
        Html5Audio(config.audio.cycleURL, true);
    });
}

var swipe = Swipe(container);

// 页面滚动到指定位置
function scrollTo(time, proportionX) {
    var distX = visualWidth * proportionX;
    swipe.scrollTo(distX, time);
}

// 小女孩
var girl = {
    elem: $('.girl'),
    getHeight: function() {
        return this.elem.height();
    },
    // 转身动作
    rotate: function() {
        this.elem.addClass('girl-rotate');
    },
    setOffset: function() {
        this.elem.css({
            left: visualWidth / 2,
            top: bridgeY - this.getHeight()
        });
    },
    getOffset: function() {
        return this.elem.offset();
    },
    getWidth: function() {
        return this.elem.width();
    }
};

// 右边飞鸟
var bird = {
    elem: $(".bird"),
    fly: function() {
    	this.elem.addClass('birdFly');
    	this.elem.transition({
        	right:container.width()
    	}, 15000, 'linear');
    }
}

// loge动画
var logo = {
    elem: $('.logo'),
    run: function() {
    	this.elem.addClass('logolightSpeedIn').on(animationEnd, function() {
        	$(this).addClass('logoshake').off();
       	});
    }
};

// 小孩走路
var boy = BoyWalk();
boy.walkTo(config.setTime.walkToThird, 0.6).then(function() {
	// 走路走到第一幅图的60%处
	scrollTo(config.setTime.walkToMiddle, 1);
	return boy.walkTo(config.setTime.walkToMiddle, 0.5);
}).then(function() {
    // 飞鸟
    bird.fly();
}).then(function() {
	// 暂停走路
	boy.stopWalk();
	return BoyToShop(boy);
}).then(function() {
	// 修正小女孩的位置
	girl.setOffset();
	// 跳转到最后的场景
	scrollTo(config.setTime.walkToEnd, 2);
	return boy.walkTo(config.setTime.walkToEnd, 0.15);
}).then(function() {
	return boy.walkTo(config.setTime.walkToBridge, 0.25, (bridgeY - girl.getHeight()) / visualHeight);
}).then(function() {
	var proportionX = (girl.getOffset().left - boy.getWidth() - instanceX + girl.getWidth() / 5) / visualWidth;
	return boy.walkTo(config.setTime.bridgeWalk, proportionX);
}).then(function(){
	boy.resetOriginal();
	setTimeout(function(){
		girl.rotate();
		boy.rotate(function(){
			logo.run();
			snowflake();
		});
	},config.setTime.waitRotate);
});

/**
 * 小孩走路
 *@param {[type]} container [description]
 */
function BoyWalk() {
	var $boy = $('#boy');
	var boyWidth = $boy.width();
	var boyHeight = $boy.height();
	// 修正小男孩的正确位置
	$boy.css({
		top: PathY - boyHeight + 25
	});

	////////////////////////////////////////////////////
	//=====================动画处理===================//
	////////////////////////////////////////////////////
	//暂停走路
	function pauseWalk() {
		$boy.addClass('pauseWalk');
	}
	
	// 恢复走路
	function restoreWalk() {
		$boy.removeClass('pauseWalk');
	}
	
	// css3的动作变化
	function slowWlak() {
		$boy.addClass('slowWalk');
	}

	// 用transition做运动
	function startRun(options, runTime) {
		var dfdPlay = $.Deferred();
		// 恢复走路
		restoreWalk();
		// 运动的属性
		$boy.transition(
			options, 
			runTime, 
			'linear', 
			function() {
				dfdPlay.resolve(); // 动画完成
			});
		return dfdPlay;
	}

	// 开始走路
	function walkRun(time, distX, disY) {
		time = time || 3000;
		// 脚动作
		slowWlak();
		// 开始走路
		var d1 = startRun({
			'left': distX + 'px',
			'top': disY ? disY : undefined
		}, time);
		return d1;
	}

	// 走进商店
	function walkToShop(doorObj,runTime) {
		var defer = $.Deferred();
		var doorObj = $('.door');
		// 门的坐标
		var offsetDoor = doorObj.offset();
		var doorOffsetLeft = offsetDoor.left;
		// 小孩当前的坐标
		var offsetBoy = $boy.offset();
		var boyOffsetLeft = offsetBoy.left;

		// 当前需要移动的坐标
		instanceX = (doorOffsetLeft + doorObj.width() / 2) - (boyOffsetLeft + $boy.width() / 2);
		
		// 开始走路
		var walkPlay = startRun({
			transform: 'translateX(' + instanceX + 'px),scale(0.3, 0.3)',
			opacity: 0.1
		}, runTime);
		// 走路完毕
		walkPlay.done(function() {
			$boy.css({
				opacity: 0
			});
			defer.resolve();
		});
		return defer;
	}

	// 走出店
	function walkOutShop(runTime) {
		var defer = $.Deferred();
		restoreWalk();
		// 开始走路
		var walkPlay = startRun({
			transform: 'translateX(' + instanceX + 'px),scale(1,1)',
			opacity: 1
		}, runTime);
		// 走路完毕
		walkPlay.done(function() {
			defer.resolve();
		});
		return defer;
	}
	
	// 计算移动距离
	function calculateDist(direction, proportion) {
		return (direction == "x" ? visualWidth : visualHeight) * proportion;
	}

	return {
		// 开始走路
		walkTo: function(time, proportionX, proportionY) {
			var distX = calculateDist('x', proportionX);
			var distY = calculateDist('y', proportionY);
			return walkRun(time, distX, distY);
		},
		// 走进商店
		toShop: function() {
			return walkToShop.apply(null, arguments);
		},
		// 取花
		takeFlower: function() {
			$boy.addClass("slowFlowerWalk");
		},
		// 走出商店
		outShop: function() {
			return walkOutShop.apply(null, arguments);
		},
		// 停止走路
		stopWalk: function() {
			pauseWalk();
		},
		setColorer: function(value) {
			$boy.css('background-color', value);
		},
		// 获取男孩的宽度
		getWidth: function() {
			return $boy.width();
		},
		// 复位初始状态
		resetOriginal: function() {
			this.stopWalk();
			// 恢复图片
			$boy.removeClass('slowWalk slowFlowerWalk').addClass('boyOriginal');
		},
		// 转身动作
		rotate: function(callback) {
			restoreWalk();
			$boy.addClass('boy-rotate');
			// 监听转身完毕
			if (callback) {
				$boy.on(animationEnd, function() {
					callback();
					$(this).off();
				});
			}
		},
		getDistance: function() {
			return $boy.offset().left;
		}
	}
}

var BoyToShop=function(boyObj) {
	var defer = $.Deferred();
	var $door = $('.door');
    var doorLeft = $('.door-left');
    var doorRight = $('.door-right');
	function doorAction(left, right, time) {
    	var defer1 = $.Deferred();
    	var count = 2;
    	// 等待开门完成
    	var complete = function() {
        	if (count == 1) {
            	defer1.resolve();
            	return;
        	}
        	count--;
    	};
    	doorLeft.transition({
        	'left': left
    	}, time, complete);
    	doorRight.transition({
        	'right': right
    	}, time, complete);
   	 	return defer1;
	}

	// 开门
	function openDoor() {
    	return doorAction('-50%', '-50%', 2000);
	}

	// 关门
	function shutDoor() {
    	return doorAction('0%', '0%', 2000);
	}

	// 取花
	function takeFlower() {
		// 增加演示等待效果
		var defer2 = $.Deferred();
		setTimeout(function() {
			// 取花
			boyObj.addClass('slowFlowerWalk');
			defer2.resolve();
		}, 1000);
		return defer2;
	}

	// 灯动画 
	var lamp = {
	    elem: $('.b_background'),
	    bright: function() {
	        this.elem.addClass('lamp-bright')
	    },
	    dark: function() {
	        this.elem.removeClass('lamp-bright');
	    }
	}

	var waitOpen = openDoor(config.setTime.openDoorTime);
	waitOpen.then(function() {
		// 亮灯
    	lamp.bright();
    	// 走进商店
    	return boyObj.toShop($door, config.setTime.walkToShop);
	}).then(function() {
    	// 取花
    	return boyObj.takeFlower();
	}).then(function() {
    	// 走出商店
    	return boyObj.outShop(config.setTime.walkOutShop);
	}).then(function() {
    	// 关门
    	shutDoor(config.setTime.shutDoorTime);
    	// 灯灭
    	lamp.dark();
    	defer.resolve();
	});
	return defer;
}

// 飘雪花
function snowflake() {
    // 飘雪容器
    var $flakeContainer = $('#snowflake');
    // 随机六张图
    function getImagesName() {
        return config.snowflakeURL[[Math.floor(Math.random() *6)]];
    }
    // 创建一个雪花元素
    function createSnowBox() {
        var url = getImagesName();
        return $('<div class="snowbox" />').css({
            'width': 41,
            'height': 41,
            'position': 'absolute',
            'backgroundSize': 'cover',
            'zIndex': 100000,
            'top': '-41px',
            'backgroundImage': 'url(' + url + ')'
        }).addClass('snowRoll');
    }
    // 开始飘花
    setInterval(function() {
        // 运动的轨迹
        var startPositionLeft = Math.random() * visualWidth - 100,
            startOpacity = 1,
            endPositionTop = visualHeight - 40,
            endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
            duration = visualHeight * 10 + Math.random() * 5000;
        // 随机透明度, 不小于0.5
        var randomStart = Math.random();
        randomStart = randomStart < 0.5 ? startOpacity : randomStart;

        // 创建一个小雪花
        var $flake = createSnowBox();

        // 设计起点位置
        $flake.css({
            left: startPositionLeft,
            opacity : randomStart
        });

        // 加入到容器
        $flakeContainer.append($flake);

        // 开始执行动画
        $flake.transition({
            top: endPositionTop,
            left: endPositionLeft,
            opacity: 0.7
        }, duration, 'ease-out', function() {
            $(this).remove(); // 结束后删除
        });
    }, 200);
}

// 背景音乐
function Html5Audio(url, isloop) {
    var audio = new Audio(url);
    audio.autoPlay = true;
    audio.loop = isloop || false;
    audio.play();
    return {
        end: function(callback) {
            audio.addEventListener('ended', function() {
                callback();
            }, false);
        }
    };
}
















