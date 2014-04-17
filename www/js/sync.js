function onSyncroniseClick()
{
	document.getElementById("syncing").innerHTML="Hello World";
}


<script>
					var syncing : boolean = false;
					function onSyncroniseClick()
					{
					syncing = true;
					
					while (syncing == true)
					{
						document.getElementById("syncing").innerHTML="Syncing." 
					}	
					}
					
					
					<!--STILL WORKING ON THIS BIT-->
				</script>