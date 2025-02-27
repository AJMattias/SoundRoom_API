export const  ultimoDia = (month: String) => {
    let meses = [
        {mes:["Enero", "Marzo", "Mayo", "Julio", "Agosto", "Octubre", "Diciembre"], dias:31},
        {mes:["Abril", "Junio", "Septiembre", "Noviembre"], dias:30}
    ]
    function getCantidadDiasMes(month: String){
        meses.forEach(item=>{
            let itemMes: string[] = item.mes;
            itemMes.forEach(element =>{
                if(element == month){
                    return 31
                }else{
                    return 30
                }
            });
        })
    }
}

