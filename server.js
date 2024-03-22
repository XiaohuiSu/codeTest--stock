/*
  输出 所有公司股票的最大绝对增长值
  给定的是一个无序的序列数据，并且有许多null值 （null值不是很规范的）
  题意理解：
  1. 无序的数据
  2. 找到每个公司的最早和最晚的两条记录，然后进行计算最终的值
  3. 数据中将会出现一些不规则的空值，比如Invalid、UNKOWN、NA、N/A等等
  4. 如果某个公司找不到两个有效的记录就是无效的，如果所有的公司都没有正增长，输出null

  注意点：
  1. js的小数计算精度问题
  2. 数据异常问题 (注意一些不规范数据)
  3. 注意try-catch
  4. 注意时空复杂度，都控制在O(n)
  5. 使用流来边遍历边对比数据

  算法思路
  1. 流的方式读取数据，边读取边做处理和判断
  2. 维护一个curDataMap，key为公司名，value为数组，记录该公司目前出现的最早的日期和最晚的日期，以及两个日期对应的股票数值
  3. 整体遍历完之后，再遍历一遍curDataMap计算最终的最大值
  4. 最后输出最终结果

  时间复杂度：O(n) 空间复杂度：O(n)
*/

const fs = require('fs');
const parse = require('csv-parse').parse // 解析CSV文件使用
let dataSample = [ 'YLB', '2015/8/13', 'notes', '846.44', 'DECREASED' ] // dataItem sample
const Big = require('big.js'); //  用于解决小数计算精度问题
const parser = parse({
  delimiter: ':'
});

let resDataMap = { // 结果map
  companyName: '',
  increaseNumber: 0
} 
let curDataMap = {}
// let dataFilePath = './test.csv'
let dataFilePath = './values.csv'
let parserObj = fs.createReadStream(dataFilePath).pipe(parser) // create a readStream

let validDataItem = (dataArr) => { // 判断当前的dataItem是否为正常数据，判断公司名是否存在，并且当前的 stock value是否合法
  let companyName = dataArr[0]
  let currentValString = dataArr[3]
  return companyName != '' && dataArr.length == dataSample.length && isNaN(Number(currentValString, 10)) == false
}

parserObj.on('data', (csvrow) => {
  //do something with csvrow  
  try {
    let curDataArr = csvrow[0].split(',') // 拿到业务数据
    if (validDataItem(curDataArr)) { // 判断是否为有效数据
      // console.log(curDataArr)
      let companyName = curDataArr[0]
      if (curDataMap[companyName]) { // 已经出现过正常的记录值了
        // 进行判断
        let curItemDate = new Date(curDataArr[1])
        if (curItemDate > curDataMap[companyName][1].currentDate) { // 比已经遍历过的日期最大值还大，则更新记录
          curDataMap[companyName][1] = {
            currentDate: curItemDate,
            currentVal: Number(curDataArr[3])
          }
        } else if (curItemDate < curDataMap[companyName][0].currentDate) { // 比已经遍历过的日期最小值还小，则更新记录
          curDataMap[companyName][0] = {
            currentDate: curItemDate,
            currentVal: Number(curDataArr[3])
          }
        }
      } else { // 初始化 key and value
        curDataMap[companyName] = [{
          currentDate: new Date(curDataArr[1]),
          currentVal: Number(curDataArr[3])
        }, {
          currentDate: new Date(curDataArr[1]),
          currentVal: Number(curDataArr[3])
        }]
      }
    }
  }
  catch(err) {
    // error handler
  }
})

parserObj.on('end',() => {
  // do something with csvData
  // console.log(curDataMap)
  for (let key in curDataMap) { // 遍历最终每个公司的日期区间数据进行计算最大值
    let curIncreaseNum = new Big(curDataMap[key][1].currentVal).minus(curDataMap[key][0].currentVal).toNumber() // 计算当前公司的 increase value
    if (curIncreaseNum > resDataMap.increaseNumber) { // 如果大于当前记录的最大值，则更新记录
      resDataMap.companyName = key
      resDataMap.increaseNumber = curIncreaseNum
    }
  }
  console.log(resDataMap)
})

parserObj.on('error',() => {
  // error handler
  // console.log(curDataMap)
})



  
