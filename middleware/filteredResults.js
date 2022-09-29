const filteredResults = (model) => async (req, res, next) => {
  let query;
  console.log(req.query);
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "limit", "page"];
  removeFields.forEach((param) => delete reqQuery[param]); // delete operator
  console.log(reqQuery);

  let queryStr = JSON.stringify(reqQuery);
  // we need to stringify because replace would not take a json object
  // err. mess.: "reqQuery.replace is not a function" if we leave it as a json object
  console.log(queryStr);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  console.log(queryStr);
  console.log(JSON.parse(queryStr));

  query = model.find(JSON.parse(queryStr));

  if (req.query.select) {
    console.log(req.query.select);
    const fields = req.query.select.split(",").join(" ");
    console.log(fields);
    query = query.select(fields);
  }

  if (req.query.sort) {
    console.log(req.query.sort);
    const sortBy = req.query.sort.split(",").join(" ");
    console.log(sortBy);
    query = query.sort(sortBy);
  } else {
    query.sort("createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1; // page number, ex. 2, default: page 1
  const limit = parseInt(req.query.limit, 10) || 25; // number of results/page, ex 4, default: 25 results/page
  const startIndex = (page - 1) * limit; // ex. (2 - 1) * 4 => 4
  const endIndex = page * limit; // ex. 2 * 4 => 8
  const total = await model.countDocuments(); // ex. 20

  query = query.skip(startIndex).limit(limit); // skip the 1st 4 docs, display 4 docs

  const pagination = {};

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  const results = await query;

  res.filteredResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = filteredResults;
