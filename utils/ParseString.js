import React from 'react'

export const parseString = (value)=>{
    if (!value.includes(",")) {
        return value.split();
      } else {
        var resultarr = [];
        value.split(",").forEach((item) => {
          resultarr.push(item.trim());
        });
        return resultarr;
      }
}