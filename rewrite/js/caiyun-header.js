var res   = {};
let Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiNjYyNzQxMzVkYWM3MGMwMDE4YzFlNDBmIiwidXNlcl9pZCI6IjVmNWJmYzU3ZDJjNjg5MDAxNGUyNmJiOCIsInZlcnNpb24iOjIsImV4cCI6MTcyMTYyNDYyOSwidmlwX2V4cGlyZWRfYXQiOjAsImlzcyI6IndlYXRoZXIiLCJpYXQiOjE3MTM4NDg2MjksInN2aXBfZXhwaXJlZF9hdCI6MTg1NjY4NTAzMSwicHJpbWFyeSI6dHJ1ZX0.bBT3vbfATa-LF1G34j4VjPTYtwcKHfG3oHIkFlmg1dY";
let userId = "5f5bfc57d2c6890014e26bb8";

res.headers = $request.headers;
if (res.headers['Authorization']){
	res.headers['Authorization'] = "Bearer " + Token;
}

if (res.headers['device-token']){
	res.headers['device-token'] = Token;
}

if (res.headers['user-id']){
	res.headers['user-id'] = userId;
}

$done(res);
